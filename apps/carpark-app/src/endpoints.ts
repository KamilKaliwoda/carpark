import express from 'express';
import { hash, genSalt, compare } from 'bcrypt';
import _ from 'lodash';
import sql from 'pg';

export class Endpoints {
  app: Express.Application;
  sql: sql;
  constructor(app, sql) {
    this.app = app;
    this.sql = sql;
    this.initializeEndpoints(app, sql);
  }
  initializeEndpoints(app: sql, sql: Express.Application) {
    validateLogIn(app, sql);
    checkIfLoginExists(app, sql);
    tryInsertingNewUser(app, sql);
    changeUserPassword(app, sql);
    getBookingConfiguration(app, sql);
    getBookingConfigurationAdministration(app, sql);
    bookParkingSpace(app, sql);
    releaseParkingSpace(app, sql);
    getBookingWeekdayConfiguration(app, sql);
    bookWeekdayParkingSpace(app, sql);
    releaseWeekdayParkingSpace(app, sql);
    activateParkingSpace(app, sql);
    deactivateParkingSpace(app, sql);
  }
}

const validateLogIn = (app, sql) => {
  app.get('/validateLogIn', async function (req, res) {
    const username: string = req.query.username;
    const password: string = req.query.password;
    try {
      const query = `
      SELECT us.username, us.name, us.surname, us.password, rl.name as role 
      FROM Users.User us
      INNER JOIN Users.Role rl
      ON rl.id = us.role_id
      WHERE username = '${username}';
      `
      const result = await sql.query(query);
      if (!_.isEmpty(result.rows)) {
        const userRecord = result.rows[0];
        const passwordMatches = await compare(password, userRecord.password);
        if (passwordMatches) {
          res.send(userRecord);
        } else {
          res.send([]);
        }
      } else {
        res.send([]);
      }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
  });
};

const checkIfLoginExists = (app, sql) => {
  app.get('/checkIfLoginExists', async function (req, res) {
    const username: string = req.query.username;
    try {
      const query = `
      SELECT username 
      FROM Users.User 
      WHERE username = '${username}';
      `
      const result = await sql.query(query);
      res.send(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
  });
};

const tryInsertingNewUser = (app, sql) => {
  app.get('/tryInsertingNewUser', function (req, res) {
    const username: string = req.query.username;
    const password: string = req.query.password;
    const name: string = req.query.name;
    const surname: string = req.query.surname;
    hash(password, 10, async function(err, hash) {
      try {
        const query = `
        DO $$
        DECLARE role_id SMALLINT;
        BEGIN

        SELECT id INTO role_id 
        FROM Users.Role 
        where name = 'user';

        INSERT INTO Users.User (username, name, surname, password, role_id)
        VALUES ('${username}', '${name}', '${surname}', '${hash}', role_id);
        END $$;
        `
        await sql.query(query);
        res.send(true);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
      }
    });
  });
};

const changeUserPassword = (app, sql) => {
  app.get('/changeUserPassword', function (req, res) {
    const username: string = req.query.username;
    const password: string = req.query.password;
    hash(password, 10, async function(err, hash) {
      try {
        const query = `
        update Users.User
        set password = '${hash}'
        where username = '${username}';
        `
        await sql.query(query);
        res.send(true);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
      }
    });
  });
};

const getBookingConfiguration = (app, sql) => {
  app.get('/getBookingConfiguration', async function (req, res) {
    const selected_date: string = req.query.selected_date;
    try {
      const query = `
      WITH cte_weekday_exclusion_filter as (
        select wps.id, wps.space_id, wps.user_id, wps.working_day_id, wps.last_update, wps.active
        from Spaces.WeekdayParkingSpaceToUser wps
        left join Spaces.WeekdayExclusionParkingSpaceToUser weps
        on weps.space_id = wps.space_id and weps.active = TRUE and weps.booking_date = CAST('${selected_date}' AS DATE)
        where wps.active = TRUE and wps.working_day_id = (select id from Days.WorkingDay where weekday = TRIM(TO_CHAR(CAST('${selected_date}' AS DATE), 'Day'))) and weps.id is NULL
      )
      
      select ps.space_number,
        COALESCE(us1.username, us2.username) as username,
        COALESCE(us1.name, us2.name) as name,
        COALESCE(us1.surname, us2.surname) as surname,
        case 
          when us1.surname is not NULL then 'Day'
          when us2.surname is not NULL then 'Weekday'
          else NULL 
        end as type
        from Spaces.ParkingSpace ps
        left join Spaces.ParkingSpaceToUser psu
        on psu.space_id = ps.id and psu.active = TRUE and psu.booking_date = CAST('${selected_date}' AS DATE)
        left join Users.User us1
        on us1.id = psu.user_id
        left join cte_weekday_exclusion_filter wef
        on ps.id = wef.space_id
        left join Users.User us2
        on us2.id = wef.user_id
        where ps.active = TRUE;
      `
      const result = await sql.query(query);
      res.send(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
  });
};

const getBookingWeekdayConfiguration = (app, sql) => {
  app.get('/getBookingWeekdayConfiguration', async function (req, res) {
    const weekday: string = req.query.weekday;
    try {
      const query = `
      select ps.space_number, us.username, us.name, us.surname
      from Spaces.ParkingSpace ps
      left join Spaces.WeekdayParkingSpaceToUser psu
      on psu.space_id = ps.id and psu.active = TRUE and psu.working_day_id = (select id from Days.WorkingDay where weekday = '${weekday}')
      left join Users.User us
      on us.id = psu.user_id
      where ps.active = TRUE;
      `
      const result = await sql.query(query);
      res.send(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
  });
};

// If it should return a value, then write it without DO loop.
const bookParkingSpace = (app, sql) => {
  app.get('/bookParkingSpace', async function (req, res) {
    const space_number: string = req.query.space_number;
    const username: string = req.query.username;
    const selected_date: string = req.query.selected_date;
    try {
      const query = `
      DO $$
      DECLARE
          space_id_var INT;
          user_id_var INT;
          status INT;
      BEGIN
          SELECT id INTO space_id_var
          FROM Spaces.ParkingSpace
          WHERE space_number = '${space_number}';
      
          SELECT id INTO user_id_var
          FROM Users.User
          WHERE username = '${username}';
      
          IF NOT EXISTS (
              SELECT 1
              FROM Spaces.ParkingSpaceToUser
              WHERE space_id = space_id_var
              AND booking_date = '${selected_date}'
              AND active = TRUE
          ) THEN
              INSERT INTO Spaces.ParkingSpaceToUser (space_id, user_id, booking_date, active)
              VALUES (space_id_var, user_id_var, '${selected_date}', TRUE);
      
              status := 1;
          ELSE
              status := 0;
          END IF;
      
          RAISE NOTICE 'Status: %', status;
      END $$;
      `
      const result = await sql.query(query);
      res.send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
  });
};

const getBookingConfigurationAdministration = (app, sql) => {
  app.get('/getBookingConfigurationAdministration', async function (req, res) {
    try {
      const query = `
      select space_number
      from Spaces.ParkingSpace
      where active = TRUE;
      `
      const result = await sql.query(query);
      res.send(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
  });
};

const releaseParkingSpace = (app, sql) => {
  app.get('/releaseParkingSpace', async function (req, res) {
    const space_number: string = req.query.space_number;
    const username: string = req.query.username;
    const selected_date: string = req.query.selected_date;
    const type: string = req.query.type;
    if (type === 'Day') {
      try {
        const query = `
        UPDATE Spaces.ParkingSpaceToUser psu
        SET active = FALSE
        FROM Users.User us, Spaces.ParkingSpace ps
        WHERE psu.user_id = us.id
        AND psu.space_id = ps.id
        AND us.username = '${username}'
        AND ps.space_number = '${space_number}'
        AND psu.booking_date = '${selected_date}';
        `
        await sql.query(query);
        res.send(true);
      } catch (error) {
          console.error(error);
          res.status(500).send('Internal server error');
      }
    } else {
      try {
        const query = `
        DO $$
        DECLARE
            space_id_var SMALLINT;
            user_id_var INT;
            status INT;
        BEGIN
        select id into space_id_var from Spaces.ParkingSpace where space_number = '${space_number}';
        select id into user_id_var from Users.User where username = '${username}';
  
        IF NOT EXISTS (select 1 from Spaces.WeekdayExclusionParkingSpaceToUser where space_id = space_id_var and booking_date = '${selected_date}' and active = TRUE)
        THEN
  
        insert into Spaces.WeekdayExclusionParkingSpaceToUser (space_id, user_id, booking_date, active)
        values (space_id_var, user_id_var, '${selected_date}', TRUE);
        
        END IF;
        END $$;
        `
        await sql.query(query);
        res.send(true);
      } catch (error) {
          console.error(error);
          res.status(500).send('Internal server error');
      }
    }
  });
};

const bookWeekdayParkingSpace = (app, sql) => {
  app.get('/bookWeekdayParkingSpace', async function (req, res) {
    const space_number: string = req.query.space_number;
    const username: string = req.query.username;
    const weekday: string = req.query.weekday;
    try {
      const query = `
      DO $$
      DECLARE
          status INT;
      BEGIN
      IF NOT EXISTS (select 1 from Spaces.WeekdayParkingSpaceToUser where space_id = (select id from Spaces.ParkingSpace where space_number = '${space_number}')
      and working_day_id = (select id from Days.WorkingDay where weekday = '${weekday}') and active = TRUE)
      THEN

      insert into Spaces.WeekdayParkingSpaceToUser (space_id, user_id, working_day_id, active)
      select (select id from Spaces.ParkingSpace where space_number = '${space_number}')
      ,(select id from Users.User where username = '${username}')
      ,(select id from Days.WorkingDay where weekday = '${weekday}')
      ,TRUE;
      
      status := 1;

      ELSE

      status := 0;
      
      END IF;
      RAISE NOTICE 'Status: %', status;
      END $$;
      `
      const result = await sql.query(query);
      res.send(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
  });
};

const releaseWeekdayParkingSpace = (app, sql) => {
  app.get('/releaseWeekdayParkingSpace', async function (req, res) {
    const space_number: string = req.query.space_number;
    const username: string = req.query.username;
    const weekday: string = req.query.weekday;
    try {
      const query = `
      update Spaces.WeekdayParkingSpaceToUser psu
      set active = FALSE
      FROM Users.User us, Spaces.ParkingSpace ps
      WHERE psu.user_id = us.id
      AND psu.space_id = ps.id
      AND us.username = '${username}'
      AND ps.space_number = '${space_number}' 
      AND psu.working_day_id = (select id from Days.WorkingDay where weekday = '${weekday}');
      `
      await sql.query(query);
      res.send(true);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
  });
};

const activateParkingSpace = (app, sql) => {
  app.get('/activateParkingSpace', async function (req, res) {
    const spaceNumber: number = req.query.spaceNumber;
    try {
      const query = `
      DO $$
      DECLARE
          space_exists BOOLEAN;
      BEGIN
          SELECT 1 INTO space_exists
          FROM Spaces.ParkingSpace
          WHERE space_number = ${spaceNumber};
          
          IF space_exists THEN
              UPDATE Spaces.ParkingSpace
              SET active = TRUE
              WHERE space_number = ${spaceNumber};
          ELSE
              INSERT INTO Spaces.ParkingSpace (space_number, active)
              VALUES (${spaceNumber}, TRUE);
          END IF;
      END $$;
      `
      await sql.query(query);
      res.send(true);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
  });
};

const deactivateParkingSpace = (app, sql) => {
  app.get('/deactivateParkingSpace', async function (req, res) {
    const spaceNumber: number = req.query.space_number;
    try {
      const query = `
      BEGIN;

      SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

      UPDATE Spaces.ParkingSpace
      SET active = FALSE
      WHERE id = (SELECT id 
        FROM Spaces.ParkingSpace
        WHERE space_number = ${spaceNumber});

      UPDATE Spaces.ParkingSpaceToUser
      SET active = FALSE
      WHERE space_id = (SELECT id 
        FROM Spaces.ParkingSpace
        WHERE space_number = ${spaceNumber});

      UPDATE Spaces.WeekdayParkingSpaceToUser
      SET active = FALSE
      WHERE space_id = (SELECT id 
        FROM Spaces.ParkingSpace
        WHERE space_number = ${spaceNumber});

      UPDATE Spaces.WeekdayExclusionParkingSpaceToUser
      SET active = FALSE
      WHERE space_id = (SELECT id 
        FROM Spaces.ParkingSpace
        WHERE space_number = ${spaceNumber});

      COMMIT;
      `
      await sql.query(query);
      res.send(true);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
  });
};
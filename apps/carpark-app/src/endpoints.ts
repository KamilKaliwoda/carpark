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
        where username = '${username};'
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
      WITH cte_weekday_exclution_filter as (
        select wps.id, wps.space_id, wps.user_id, wps.working_day_id, wps.last_update, wps.active
        from Spaces.WeekdayParkingSpaceToUser wps
        left join Spaces.WeekdayExclusionParkingSpaceToUser weps
        on weps.space_id = wps.space_id and weps.active = TRUE and weps.booking_date = CAST(${selected_date} AS DATE)
        where wps.active = TRUE and wps.working_day_id = (select id from Days.WorkingDay where weekday = TO_CHAR(CAST(${selected_date} AS DATE), 'Day')) and weps.id is NULL
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
        on psu.space_id = ps.id and psu.active = TRUE and psu.booking_date = CAST(${selected_date} AS DATE)
        left join Users.User us1
        on us1.id = psu.user_id
        left join cte_weekday_exclution_filter wef
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
          space_id_var SMALLINT;
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
        update psu
        set active = FALSE
        from Spaces.ParkingSpaceToUser psu
        inner join Users.User us
        on us.id = psu.user_id
        inner join Spaces.ParkingSpace ps
        on ps.id = psu.space_id
        where us.username = '${username}' and ps.space_number = '${space_number}' and psu.booking_date = '${selected_date}';
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
            space_id SMALLINT;
            user_id INT;
            status INT;
        BEGIN
        select id into space_id from Spaces.ParkingSpace where space_number = '${space_number}'
        select id into user_id from Users.User where username = '${username}'
  
        IF NOT EXISTS (select 1 from Spaces.WeekdayExclusionParkingSpaceToUser where space_id = space_id and booking_date = '${selected_date}' and active = TRUE)
        THEN
  
        insert into Spaces.WeekdayExclusionParkingSpaceToUser (space_id, user_id, booking_date, active)
        values (space_id, user_id, '${selected_date}', TRUE)
        
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
  app.get('/bookWeekdayParkingSpace', function (req, res) {
    const space_number: string = req.query.space_number;
    const username: string = req.query.username;
    const weekday: string = req.query.weekday;
    const request = new sql.Request();

    request.query(
      `declare @space_id smallint = (select id from dbo.ParkingSpace where space_number = '${space_number}')
      declare @user_id int = (select id from dbo.[User] where username = '${username}')
      declare @weekday_id smallint = (select id from dbo.WorkingDay where weekday = '${weekday}')

      if (select 1 from dbo.WeekdayParkingSpaceToUser where space_id = @space_id 
      and working_day_id = @weekday_id and active = 1) is null
      begin

      insert into dbo.WeekdayParkingSpaceToUser (space_id, user_id, working_day_id, active)
      values (@space_id, @user_id, @weekday_id, 1)
      
      select 1 as status
      
      end
      else
      begin
      
      select 0 as status
      
      end`,
      function (err, recordset) {
        if (err) console.log(err);
        res.send(recordset['recordset'][0]);
      },
    );
  });
};

const releaseWeekdayParkingSpace = (app, sql) => {
  app.get('/releaseWeekdayParkingSpace', function (req, res) {
    const space_number: string = req.query.space_number;
    const username: string = req.query.username;
    const weekday: string = req.query.weekday;
    const request = new sql.Request();

    request.query(
      `update psu
      set active = 0
      from dbo.WeekdayParkingSpaceToUser psu
      inner join dbo.[User] us
      on us.id = psu.user_id
      inner join dbo.ParkingSpace ps
      on ps.id = psu.space_id
      where us.username = '${username}' and ps.space_number = '${space_number}' and psu.working_day_id = (select id from dbo.WorkingDay where weekday = '${weekday}')`,
      function (err, recordset) {
        if (err) console.log(err);
        res.send(true);
      },
    );
  });
};

const activateParkingSpace = (app, sql) => {
  app.get('/activateParkingSpace', function (req, res) {
    const spaceNumber: number = req.query.spaceNumber;
    const request = new sql.Request();
    request.query(
      `declare @space_number int = ${spaceNumber}
      if exists (select 1 from dbo.ParkingSpace where space_number = @space_number)
      begin
        update dbo.ParkingSpace
        set active = 1
        where space_number = @space_number
      end 
      else 
      begin
        insert into dbo.ParkingSpace (space_number, active)
        values (@space_number, 1)
      end`,
      function (err, recordset) {
        if (err) console.log(err);
        res.send(true);
      },
    );
  });
};

const deactivateParkingSpace = (app, sql) => {
  app.get('/deactivateParkingSpace', function (req, res) {
    const spaceNumber: number = req.query.space_number;
    const request = new sql.Request();
    request.query(
      `SET XACT_ABORT ON
      SET TRANSACTION ISOLATION LEVEL SERIALIZABLE
      BEGIN TRANSACTION
      
      
      declare @space_id smallint = (select id from dbo.ParkingSpace where space_number = ${spaceNumber})

      update dbo.ParkingSpace
      set active = 0
      where id = @space_id
      
      update dbo.ParkingSpaceToUser
      set active = 0
      where space_id = @space_id
      
      update dbo.WeekdayParkingSpaceToUser
      set active = 0
      where space_id = @space_id
      
      update dbo.WeekdayExclusionParkingSpaceToUser
      set active = 0
      where space_id = @space_id
      
      COMMIT TRANSACTION`,
      function (err, recordset) {
        if (err) console.log(err);
        res.send(true);
      },
    );
  });
};
import express from 'express';
import sql from 'mssql';
import { hash, genSalt, compare } from 'bcrypt';
import _ from 'lodash';

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
  app.get('/validateLogIn', function (req, res) {
    const username: string = req.query.username;
    let password: string = req.query.password;
    const request = new sql.Request();
    request.query(
      `select us.username, us.name, us.surname, us.password, rl.name as role from dbo.[User] us
      inner join dbo.Role rl
      on rl.id = us.role_id
      where username = '${username}'`,
      function (err, recordset) {
        if (err) console.log(err);
        if (!_.isEqual(recordset['recordset'], [])) {
          compare(password, recordset['recordset'][0]['password'], function(err, result) {
            if (result) {
              res.send(recordset['recordset']);
            } else {
              res.send([]);
            }
          });
        }
      },
    );
  });
};

const checkIfLoginExists = (app, sql) => {
  app.get('/checkIfLoginExists', function (req, res) {
    const username: string = req.query.username;
    const request = new sql.Request();

    request.query(
      `select username from dbo.[User] where username = '${username}'`,
      function (err, recordset) {
        if (err) console.log(err);
        res.send(recordset['recordset']);
      },
    );
  });
};

const tryInsertingNewUser = (app, sql) => {
  app.get('/tryInsertingNewUser', function (req, res) {
    const username: string = req.query.username;
    const password: string = req.query.password;
    const name: string = req.query.name;
    const surname: string = req.query.surname;
    const request = new sql.Request();
    hash(password, 10, function(err, hash) {
      request.query(
        `declare @role_id smallint = (select id from dbo.Role where name = 'user')
        
        insert into dbo.[User] (username, name, surname, password, role_id)
        values ('${username}', '${name}', '${surname}', '${hash}', @role_id)`,
        function (err, recordset) {
          if (err) console.log(err);
          res.send(true);
        },
      );
    });
  });
};

const changeUserPassword = (app, sql) => {
  app.get('/changeUserPassword', function (req, res) {
    const username: string = req.query.username;
    const password: string = req.query.password;
    const request = new sql.Request();
    hash(password, 10, function(err, hash) {
      request.query(
        `update dbo.[User]
        set password = '${hash}'
        where username = '${username}'`,
        function (err, recordset) {
          if (err) console.log(err);
          res.send(true);
        },
      );
    });
  });
};

const getBookingConfiguration = (app, sql) => {
  app.get('/getBookingConfiguration', function (req, res) {
    const selected_date: string = req.query.selected_date;
    const request = new sql.Request();

    request.query(
      `declare @booking_date VARCHAR(100) = '${selected_date}'

      ;with cte_weekday_exclution_filter (id, space_id, user_id, working_day_id, last_update, active) as (
        select wps.id, wps.space_id, wps.user_id, wps.working_day_id, wps.last_update, wps.active
        from dbo.WeekdayParkingSpaceToUser wps
        left join dbo.WeekdayExclusionParkingSpaceToUser weps
        on weps.space_id = wps.space_id and weps.active = 1 and weps.booking_date = cast(@booking_date as date)
        where wps.active = 1 and wps.working_day_id = (select id from dbo.WorkingDay where weekday = DATENAME(WEEKDAY, @booking_date)) and weps.id is NULL
      )
      
      select ps.space_number,
          ISNULL(us1.username, us2.username) as username,
          ISNULL(us1.[name], us2.[name]) as name,
          ISNULL(us1.surname, us2.surname) as surname,
          case 
          when us1.surname is not NULL then 'Day'
          when us2.surname is not NULL then 'Weekday'
          else NULL 
          end as type
            from dbo.ParkingSpace ps
            left join dbo.ParkingSpaceToUser psu
            on psu.space_id = ps.id and psu.active = 1 and psu.booking_date = cast(@booking_date as date)
            left join dbo.[User] us1
            on us1.id = psu.user_id
          left join cte_weekday_exclution_filter wef
          on ps.id = wef.space_id
          left join dbo.[User] us2
            on us2.id = wef.user_id
            where ps.active = 1`,
      function (err, recordset) {
        if (err) console.log(err);
        res.send(recordset['recordset']);
      },
    );
  });
};

const getBookingWeekdayConfiguration = (app, sql) => {
  app.get('/getBookingWeekdayConfiguration', function (req, res) {
    const weekday: string = req.query.weekday;
    const request = new sql.Request();

    request.query(
      `select ps.space_number, us.username, us.[name], us.surname
      from dbo.ParkingSpace ps
      left join dbo.WeekdayParkingSpaceToUser psu
      on psu.space_id = ps.id and psu.active = 1 and psu.working_day_id = (select id from dbo.WorkingDay where weekday = '${weekday}')
      left join dbo.[User] us
      on us.id = psu.user_id
      where ps.active = 1`,
      function (err, recordset) {
        if (err) console.log(err);
        res.send(recordset['recordset']);
      },
    );
  });
};

const bookParkingSpace = (app, sql) => {
  app.get('/bookParkingSpace', function (req, res) {
    const space_number: string = req.query.space_number;
    const username: string = req.query.username;
    const selected_date: string = req.query.selected_date;
    const request = new sql.Request();

    request.query(
      `declare @space_id smallint = (select id from dbo.ParkingSpace where space_number = '${space_number}')
      declare @user_id int = (select id from dbo.[User] where username = '${username}')

      if (select 1 from dbo.ParkingSpaceToUser where space_id = @space_id and booking_date = '${selected_date}' and active = 1) is null
      begin

      insert into dbo.ParkingSpaceToUser (space_id, user_id, booking_date, active)
      values (@space_id, @user_id, '${selected_date}', 1)
      
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

const getBookingConfigurationAdministration = (app, sql) => {
  app.get('/getBookingConfigurationAdministration', function (req, res) {
    const request = new sql.Request();

    request.query(
      `select space_number
      from dbo.ParkingSpace
      where active = 1`,
      function (err, recordset) {
        if (err) console.log(err);
        res.send(recordset['recordset']);
      },
    );
  });
};

const releaseParkingSpace = (app, sql) => {
  app.get('/releaseParkingSpace', function (req, res) {
    const space_number: string = req.query.space_number;
    const username: string = req.query.username;
    const selected_date: string = req.query.selected_date;
    const type: string = req.query.type;
    const request = new sql.Request();
    if (type === 'Day') {
      request.query(
        `update psu
        set active = 0
        from dbo.ParkingSpaceToUser psu
        inner join dbo.[User] us
        on us.id = psu.user_id
        inner join dbo.ParkingSpace ps
        on ps.id = psu.space_id
        where us.username = '${username}' and ps.space_number = '${space_number}' and psu.booking_date = '${selected_date}'`,
        function (err, recordset) {
          if (err) console.log(err);
          res.send(true);
        },
      );
    } else {
      request.query(
        `declare @space_id smallint = (select id from dbo.ParkingSpace where space_number = '${space_number}')
        declare @user_id int = (select id from dbo.[User] where username = '${username}')
  
        if (select 1 from dbo.WeekdayExclusionParkingSpaceToUser where space_id = @space_id and booking_date = '${selected_date}' and active = 1) is null
        begin
  
        insert into dbo.WeekdayExclusionParkingSpaceToUser (space_id, user_id, booking_date, active)
        values (@space_id, @user_id, '${selected_date}', 1)
        
        select 1 as status
        
        end
        else
        begin
        
        select 0 as status
        
        end`,
        function (err, recordset) {
          if (err) console.log(err);
          res.send(true);
        },
      );
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
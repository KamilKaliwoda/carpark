import express from 'express';
import sql from 'pg';

export class PostUpdate {
  app: Express.Application;
  sql: sql;
  constructor(app, sql) {
    this.app = app;
    this.sql = sql;
    this.runPostUpdate(app, sql);
  }
  async runPostUpdate(app: Express.Application, sql: sql) {
    try {
        await addMissingSchemas(app, sql);
        await addMissingTables(app, sql);
        await addMissingRoles(app, sql);
        await addMissingWeekdays(app, sql);
        console.log('PostUpdate executed successfully.');
    } catch (error) {
        throw new Error('addMissingSchemas: ' + error.message);
    }
  }
}

const addMissingSchemas = async (app, sql) => {
    try {
        const query = `
        CREATE SCHEMA IF NOT EXISTS Users;
        CREATE SCHEMA IF NOT EXISTS Spaces;
        CREATE SCHEMA IF NOT EXISTS Days;
        `
        const res = await sql.query(query);
    } catch (error) {
        throw new Error('addMissingSchemas: ' + error.message);
    }
};

const addMissingTables = async (app, sql) => {
    try {
        const query = `
        CREATE TABLE IF NOT EXISTS Spaces.ParkingSpace (
            id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            space_number INT NOT NULL,
            active BOOLEAN
        );

        CREATE TABLE IF NOT EXISTS Spaces.ParkingSpaceToUser (
            id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            space_id SMALLINT NOT NULL,
            user_id INT NOT NULL,
            booking_date DATE NOT NULL,
            last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            active BOOLEAN
        );

        CREATE TABLE IF NOT EXISTS Spaces.WeekdayExclusionParkingSpaceToUser (
            id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            space_id SMALLINT NOT NULL,
            user_id INT NOT NULL,
            booking_date DATE NOT NULL,
            last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            active BOOLEAN
        );

        CREATE TABLE IF NOT EXISTS Spaces.WeekdayParkingSpaceToUser (
            id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            space_id SMALLINT NOT NULL,
            user_id INT NOT NULL,
            working_day_id SMALLINT NOT NULL,
            last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            active BOOLEAN
        );

        CREATE TABLE IF NOT EXISTS Days.WorkingDay (
            id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            weekday VARCHAR(100) UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Users.User (
            id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            name VARCHAR(50) NOT NULL,
            surname VARCHAR(50) NOT NULL,
            password VARCHAR(1000) NOT NULL,
            role_id SMALLINT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS Users.Role (
            id SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL 
        );
          `
        const res = await sql.query(query);
    } catch (error) {
        throw new Error('addMissingTables: ' + error.message);
    }
};

const addMissingRoles = async (app, sql) => {
    try {
        const query = `
        INSERT INTO Users.Role (name)
        VALUES ('admin')
        ON CONFLICT (name) DO NOTHING;

        INSERT INTO Users.Role (name)
        VALUES ('user')
        ON CONFLICT (name) DO NOTHING;
          `
        const res = await sql.query(query);
    } catch (error) {
        throw new Error('addMissingRoles: ' + error.message);
    }
};

const addMissingWeekdays = async (app, sql) => {
    try {
        const query = `
        INSERT INTO Days.WorkingDay (weekday)
        VALUES ('Monday')
        ON CONFLICT (weekday) DO NOTHING;

        INSERT INTO Days.WorkingDay (weekday)
        VALUES ('Tuesday')
        ON CONFLICT (weekday) DO NOTHING;

        INSERT INTO Days.WorkingDay (weekday)
        VALUES ('Wednesday')
        ON CONFLICT (weekday) DO NOTHING;

        INSERT INTO Days.WorkingDay (weekday)
        VALUES ('Thursday')
        ON CONFLICT (weekday) DO NOTHING;

        INSERT INTO Days.WorkingDay (weekday)
        VALUES ('Friday')
        ON CONFLICT (weekday) DO NOTHING;
          `
        const res = await sql.query(query);
    } catch (error) {
        throw new Error('addMissingWeekdays: ' + error.message);
    }
};
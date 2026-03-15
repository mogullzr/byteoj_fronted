/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TimeZone } from './TimeZone';
import type { ZoneId } from './ZoneId';
export type DateTime = {
    am?: boolean;
    date?: number;
    day?: number;
    firstDayOfWeek?: DateTime.firstDayOfWeek;
    hours?: number;
    lastDayOfMonth?: number;
    leapYear?: boolean;
    minutes?: number;
    month?: number;
    mutable?: boolean;
    pm?: boolean;
    seconds?: number;
    time?: number;
    timeZone?: TimeZone;
    timezoneOffset?: number;
    weekend?: boolean;
    year?: number;
    zoneId?: ZoneId;
};
export namespace DateTime {
    export enum firstDayOfWeek {
        FRIDAY = 'FRIDAY',
        MONDAY = 'MONDAY',
        SATURDAY = 'SATURDAY',
        SUNDAY = 'SUNDAY',
        THURSDAY = 'THURSDAY',
        TUESDAY = 'TUESDAY',
        WEDNESDAY = 'WEDNESDAY',
    }
}


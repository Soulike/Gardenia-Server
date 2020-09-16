import Redis from 'ioredis';
import {REDIS} from '../../../CONFIG';
import {DATABASE_TO_NUMBER} from '../../DATABASE_TO_NUMBER';

export const RateLimit = new Redis({...REDIS, db: DATABASE_TO_NUMBER.RATE_LIMIT});
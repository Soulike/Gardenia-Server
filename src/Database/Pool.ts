import {Pool} from 'pg';
import {DATABASE} from '../CONFIG';

export default new Pool(DATABASE);
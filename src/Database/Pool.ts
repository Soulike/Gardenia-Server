import {Pool, types} from 'pg';
import {DATABASE} from '../CONFIG';

types.setTypeParser(types.builtins.INT2, val => Number.parseInt(val));
types.setTypeParser(types.builtins.INT4, val => Number.parseInt(val));
types.setTypeParser(types.builtins.INT8, val => Number.parseInt(val));

export default new Pool(DATABASE);
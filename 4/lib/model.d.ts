
import {Promise} from './promise';
import {Col, Fn, Literal, Where} from './utils';
import {SyncOptions} from './sequelize';
import {QueryOptions} from './query-interface';
import {Transaction} from './transaction';
import {DataType} from './data-types';
import {Sequelize} from './sequelize';
import {AbstractDeferrable} from './deferrable';
import {ModelManager} from './model-manager';
import {
  Association,
  BelongsTo,
  BelongsToOptions,
  HasOne,
  HasOneOptions,
  HasMany,
  HasManyOptions,
  BelongsToMany,
  BelongsToManyOptions
} from './associations/index';

export type GroupOption = string | Fn | Col | (string | Fn | Col)[];

/**
 * Options to pass to Model on drop
 */
export interface DropOptions {

  /**
   * Also drop all objects depending on this table, such as views. Only works in postgres
   */
  cascade?: boolean;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

}

/**
 * Schema Options provided for applying a schema to a model
 */
export interface SchemaOptions {

  /**
   * The character(s) that separates the schema name from the table name
   */
  schemaDelimeter?: string,

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

}

/**
 * Scope Options for Model.scope
 */
export interface ScopeOptions {

  /**
   * The scope(s) to apply. Scopes can either be passed as consecutive arguments, or as an array of arguments.
   * To apply simple scopes and scope functions with no arguments, pass them as strings. For scope function,
   * pass an object, with a `method` property. The value can either be a string, if the method does not take
   * any arguments, or an array, where the first element is the name of the method, and consecutive elements
   * are arguments to that method. Pass null to remove all scopes, including the default.
   */
  method: string | Array<any>;

}

/**
 * The type accepted by every `where` option
 *
 * The `Array<string | number>` is to support string with replacements, like `['id > ?', 25]`
 */
export type WhereOptions<TInstance extends Instance> =
  WhereAttributeHash<TInstance>
  | AndOperator<TInstance, keyof TInstance>
  | OrOperator<TInstance, keyof TInstance>
  | Where
  | Array<string | number>;

/**
 * Example: `$any: [2,3]` becomes `ANY ARRAY[2, 3]::INTEGER`
 *
 * _PG only_
 */
export interface AnyOperator {
  $any: Array<string | number>;
}

/** Undocumented? */
export interface AllOperator {
  $all: Array<string | number>;
}

/**
 * Operators that can be used in WhereOptions
 *
 * See http://docs.sequelizejs.com/en/v3/docs/querying/#operators
 */
export interface WhereOperators<TInstance extends Instance, K extends keyof TInstance> {

  /**
   * Example: `$any: [2,3]` becomes `ANY ARRAY[2, 3]::INTEGER`
   *
   * _PG only_
   */
  $any?: Array<TInstance[K]>;

  /** Example: `$gte: 6,` becomes `>= 6` */
  $gte?: TInstance[K];

  /** Example: `$lt: 10,` becomes `< 10` */
  $lt?: TInstance[K];

  /** Example: `$lte: 10,` becomes `<= 10` */
  $lte?: TInstance[K];

  /** Example: `$ne: 20,` becomes `!= 20` */
  $ne?: TInstance[K];

  /** Example: `$not: true,` becomes `IS NOT TRUE` */
  $not?: TInstance[K] | WhereOperators<TInstance, K>;

  /** Example: `$between: [6, 10],` becomes `BETWEEN 6 AND 10` */
  $between?: [TInstance[K], TInstance[K]];

  /** Example: `$in: [1, 2],` becomes `IN [1, 2]` */
  $in?: Array<TInstance[K]> | Literal;

  /** Example: `$notIn: [1, 2],` becomes `NOT IN [1, 2]` */
  $notIn?: Array<TInstance[K]> | Literal;

  /**
   * Examples:
   *  - `$like: '%hat',` becomes `LIKE '%hat'`
   *  - `$like: { $any: ['cat', 'hat']}` becomes `LIKE ANY ARRAY['cat', 'hat']`
   */
  $like?: string | AnyOperator | AllOperator;

  /**
   * Examples:
   *  - `$notLike: '%hat'` becomes `NOT LIKE '%hat'`
   *  - `$notLike: { $any: ['cat', 'hat']}` becomes `NOT LIKE ANY ARRAY['cat', 'hat']`
   */
  $notLike?: string | AnyOperator | AllOperator;

  /**
   * case insensitive PG only
   *
   * Examples:
   *  - `$iLike: '%hat'` becomes `ILIKE '%hat'`
   *  - `$iLike: { $any: ['cat', 'hat']}` becomes `ILIKE ANY ARRAY['cat', 'hat']`
   */
  $ilike?: string | AnyOperator | AllOperator;

  /**
   * case insensitive PG only
   *
   * Examples:
   *  - `$iLike: '%hat'` becomes `ILIKE '%hat'`
   *  - `$iLike: { $any: ['cat', 'hat']}` becomes `ILIKE ANY ARRAY['cat', 'hat']`
   */
  $iLike?: string | AnyOperator | AllOperator;

  /**
   * PG array overlap operator
   *
   * Example: `$overlap: [1, 2]` becomes `&& [1, 2]`
   */
  $overlap?: [number, number];

  /**
   * PG array contains operator
   *
   * Example: `$contains: [1, 2]` becomes `@> [1, 2]`
   */
  $contains?: any[];

  /**
   * PG array contained by operator
   *
   * Example: `$contained: [1, 2]` becomes `<@ [1, 2]`
   */
  $contained?: any[];

  /** Example: `$gt: 6,` becomes `> 6` */
  $gt?: TInstance[K];

  /**
   * PG only
   *
   * Examples:
   *  - `$notILike: '%hat'` becomes `NOT ILIKE '%hat'`
   *  - `$notLike: ['cat', 'hat']` becomes `LIKE ANY ARRAY['cat', 'hat']`
   */
  $notILike?: string | AnyOperator | AllOperator;

  /** Example: `$notBetween: [11, 15],` becomes `NOT BETWEEN 11 AND 15` */
  $notBetween?: [number, number];
}

/** Example: `$or: [{a: 5}, {a: 6}]` becomes `(a = 5 OR a = 6)` */
export interface OrOperator<TInstance extends Instance, K extends keyof TInstance> {
  $or: WhereOperators<TInstance, K> | WhereAttributeHash<TInstance> | Array<WhereOperators<TInstance, K> | WhereAttributeHash<TInstance>>;
}

/** Example: `$and: {a: 5}` becomes `AND (a = 5)` */
export interface AndOperator<TInstance extends Instance, K extends keyof TInstance> {
  $and: WhereOperators<TInstance, K> | WhereAttributeHash<TInstance> | Array<WhereOperators<TInstance, K> | WhereAttributeHash<TInstance>>;
}

/**
 * Where Geometry Options
 */
export interface WhereGeometryOptions {
  type: string;
  coordinates: Array<Array<number> | number>;
}

/**
 * A hash of attributes to describe your search.
 */
export type WhereAttributeHash<TInstance extends Instance> = {
  /**
   * Possible key values:
   * - A simple attribute name
   * - A nested key for JSON columns
   *
   *       {
   *         "meta.audio.length": {
   *           $gt: 20
   *         }
   *       }
   */
  [K in keyof TInstance]?:
    TInstance[K] // literal value
    | WhereOperators<TInstance, K>
    | Col // reference another column
    | OrOperator<TInstance, K>
    | AndOperator<TInstance, K>
    | WhereGeometryOptions
    | Array<string | number>; // implicit $or;
}

/**
 * Through options for Include Options
 */
export interface IncludeThroughOptions<TThroughInstance extends Instance> {

  /**
   * Filter on the join model for belongsToMany relations
   */
  where?: WhereOptions<TThroughInstance>;

  /**
   * A list of attributes to select from the join model for belongsToMany relations
   */
  attributes?: FindAttributeOptions<TThroughInstance>;

}

export type Includeable<TSourceModel extends Model<TSourceInstance>, TSourceInstance extends Instance> =
  Model<Instance> // An associated model
  | Association<TSourceModel, Model<Instance>> // An association between the source model and an associated model
  | IncludeOptions<TSourceModel, TSourceInstance>;

/**
 * Complex include options
 */
export interface IncludeOptions<TSourceModel extends Model<TSourceInstance>, TSourceInstance extends Instance> {

  /**
   * The model you want to eagerly load
   */
  model?: TSourceModel;

  /**
   * The alias of the relation, in case the model you want to eagerly load is aliassed. For `hasOne` /
   * `belongsTo`, this should be the singular name, and for `hasMany`, it should be the plural
   */
  as?: string;

  /**
   * The association you want to eagerly load. (This can be used instead of providing a model/as pair)
   */
  association?: Association<TSourceModel, Model<Instance>>;

  /**
   * Where clauses to apply to the child models. Note that this converts the eager load to an inner join,
   * unless you explicitly set `required: false`
   */
  where?: WhereOptions<TSourceInstance>;

  /**
   * A list of attributes to select from the child model
   */
  attributes?: FindAttributeOptions<TSourceInstance>;

  /**
   * If true, converts to an inner join, which means that the parent model will only be loaded if it has any
   * matching children. True if `include.where` is set, false otherwise.
   */
  required?: boolean;

  /**
   * Limit include. Only available when setting `separate` to true.
   */
  limit?: number;

  /**
   * Run include in separate queries.
   */
  separate?: boolean;

  /**
   * Through Options
   */
  through?: IncludeThroughOptions<any>;

  /**
   * Load further nested related models
   */
  include?: Includeable<TSourceModel, TSourceInstance>[];

  /**
   * Order include. Only available when setting `separate` to true.
   */
  order?: Order<TSourceInstance>;
}

export type OrderItem<TInstance extends Instance> =
  keyof TInstance | Fn | Col | Literal |
  [keyof TInstance | Col | Fn | Literal, string] |
  [Model<TInstance> | { model: Model<TInstance>, as: string }, string, string] |
  [Model<TInstance>, Model<TInstance>, string, string];
export type Order<TInstance extends Instance> = string | Fn | Col | Literal | OrderItem<TInstance>[];

export type FindAttributeOptions<TInstance extends Instance> =
  Array<keyof TInstance | [keyof TInstance | Literal | Fn, string]> |
  {
    exclude: Array<keyof TInstance>;
    include?: Array<keyof TInstance | [keyof TInstance | Literal | Fn, string]>;
  } | {
    exclude?: Array<keyof TInstance>;
    include: Array<keyof TInstance | [keyof TInstance | Literal | Fn, string]>;
  };

/**
 * Options that are passed to any model creating a SELECT query
 *
 * A hash of options to describe the scope of the search
 */
export interface FindOptions<TModel extends Model<TInstance>, TInstance extends Instance> {
  /**
   * A hash of attributes to describe your search. See above for examples.
   */
  where?: WhereOptions<TInstance>;

  /**
   * A list of the attributes that you want to select. To rename an attribute, you can pass an array, with
   * two elements - the first is the name of the attribute in the DB (or some kind of expression such as
   * `Sequelize.literal`, `Sequelize.fn` and so on), and the second is the name you want the attribute to
   * have in the returned instance
   */
  attributes?: FindAttributeOptions<TInstance>;

  /**
   * If true, only non-deleted records will be returned. If false, both deleted and non-deleted records will
   * be returned. Only applies if `options.paranoid` is true for the model.
   */
  paranoid?: boolean;

  /**
   * A list of associations to eagerly load using a left join. Supported is either
   * `{ include: [ Model1, Model2, ...]}` or `{ include: [{ model: Model1, as: 'Alias' }]}`.
   * If your association are set up with an `as` (eg. `X.hasMany(Y, { as: 'Z }`, you need to specify Z in
   * the as attribute when eager loading Y).
   */
  include?: Includeable<TModel, TInstance>[];

  /**
   * Specifies an ordering. If a string is provided, it will be escaped. Using an array, you can provide
   * several columns / functions to order by. Each element can be further wrapped in a two-element array. The
   * first element is the column / function to order by, the second is the direction. For example:
   * `order: [['name', 'DESC']]`. In this way the column will be escaped, but the direction will not.
   */
  order?: Order<TInstance>;

  /**
   * GROUP BY in sql
   */
  group?: GroupOption;

  /**
   * Limit the results
   */
  limit?: number;

  /**
   * Skip the results;
   */
  offset?: number;

  /**
   * Transaction to run query under
   */
  transaction?: Transaction;

  /**
   * Lock the selected rows. Possible options are transaction.LOCK.UPDATE and transaction.LOCK.SHARE.
   * Postgres also supports transaction.LOCK.KEY_SHARE, transaction.LOCK.NO_KEY_UPDATE and specific model
   * locks with joins. See [transaction.LOCK for an example](transaction#lock)
   */
  lock?: string | { level: string, of: Model<Instance> };

  /**
   * Return raw result. See sequelize.query for more information.
   */
  raw?: boolean;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

  /**
   * having ?!?
   */
  having?: WhereAttributeHash<TInstance>;

}

/**
 * Options for Model.count method
 */
export interface CountOptions<TModel extends Model<TInstance>, TInstance extends Instance> {

  /**
   * A hash of search attributes.
   */
  where?: WhereOptions<TInstance>;

  /**
   * Include options. See `find` for details
   */
  include?: Includeable<TModel, TInstance>[];

  /**
   * Apply COUNT(DISTINCT(col))
   */
  distinct?: boolean;

  /**
   * Used in conjustion with `group`
   */
  attributes?: FindAttributeOptions<TInstance>;

  /**
   * GROUP BY in sql
   */
  group?: GroupOption;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

  transaction?: Transaction;
}

export interface FindAndCountOptions<TModel extends Model<TInstance>, TInstance extends Instance> extends CountOptions<TModel, TInstance>, FindOptions<TModel, TInstance> { }

/**
 * Options for Model.build method
 */
export interface BuildOptions<TModel extends Model<TInstance>, TInstance extends Instance> {

  /**
   * If set to true, values will ignore field and virtual setters.
   */
  raw?: boolean;

  /**
   * Is this record new
   */
  isNewRecord?: boolean;

  /**
   * an array of include options - Used to build prefetched/included model instances. See `set`
   *
   * TODO: See set
   */
  include?: Includeable<TModel, TInstance>[];

}

/**
 * Options for Model.create method
 */
export interface CreateOptions<TModel extends Model<TInstance>, TInstance extends Instance> extends BuildOptions<TModel, TInstance> {

  /**
   * If set, only columns matching those in fields will be saved
   */
  fields?: Array<keyof TInstance>;

  /**
   * On Duplicate
   */
  onDuplicate?: string;

  /**
   * Transaction to run query under
   */
  transaction?: Transaction;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

  silent?: boolean;

  returning?: boolean;
}

/**
 * Options for Model.findOrInitialize method
 */
export interface FindOrInitializeOptions<TInstance extends Instance> {

  /**
   * A hash of search attributes.
   */
  where: WhereOptions<TInstance>;

  /**
   * Default values to use if building a new instance
   */
  defaults?: Partial<TInstance>;

  /**
   * Transaction to run query under
   */
  transaction?: Transaction;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

}

/**
 * Options for Model.upsert method
 */
export interface UpsertOptions<TInstance extends Instance> {
  /**
   * Run validations before the row is inserted
   */
  validate?: boolean;

  /**
   * The fields to insert / update. Defaults to all fields
   */
  fields?: Array<keyof TInstance>;

  /**
   * Transaction to run query under
   */
  transaction?: Transaction;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

  /**
   * An optional parameter to specify the schema search_path (Postgres only)
   */
  searchPath?: string;

  /**
   * Print query execution time in milliseconds when logging SQL.
   */
  benchmark?: boolean;
}

/**
 * Options for Model.bulkCreate method
 */
export interface BulkCreateOptions<TInstance extends Instance> {

  /**
   * Fields to insert (defaults to all fields)
   */
  fields?: Array<keyof TInstance>;

  /**
   * Should each row be subject to validation before it is inserted. The whole insert will fail if one row
   * fails validation
   */
  validate?: boolean;

  /**
   * Run before / after bulk create hooks?
   */
  hooks?: boolean;

  /**
   * Run before / after create hooks for each individual Instance? BulkCreate hooks will still be run if
   * options.hooks is true.
   */
  individualHooks?: boolean;

  /**
   * Ignore duplicate values for primary keys? (not supported by postgres)
   *
   * Defaults to false
   */
  ignoreDuplicates?: boolean;

  /**
   * Fields to update if row key already exists (on duplicate key update)? (only supported by mysql &
   * mariadb). By default, all fields are updated.
   */
  updateOnDuplicate?: Array<string>;

  /**
   * Transaction to run query under
   */
  transaction?: Transaction;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

}

/**
 * The options passed to Model.destroy in addition to truncate
 */
export interface TruncateOptions {

  /**
   * Transaction to run query under
   */
  transaction?: Transaction;

  /**
   * Only used in conjuction with TRUNCATE. Truncates  all tables that have foreign-key references to the
   * named table, or to any tables added to the group due to CASCADE.
   *
   * Defaults to false;
   */
  cascade?: boolean;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

  /**
   * Run before / after bulk destroy hooks?
   */
  hooks?: boolean;

  /**
   * If set to true, destroy will SELECT all records matching the where parameter and will execute before /
   * after destroy hooks on each row
   */
  individualHooks?: boolean;

  /**
   * How many rows to delete
   */
  limit?: number;

  /**
   * Delete instead of setting deletedAt to current timestamp (only applicable if `paranoid` is enabled)
   */
  force?: boolean;

  /**
   * Only used in conjunction with `truncate`.
   * Automatically restart sequences owned by columns of the truncated table
   */
  restartIdentity?: boolean;
}

/**
 * Options used for Model.destroy
 */
export interface DestroyOptions<TInstance extends Instance> extends TruncateOptions {

  /**
   * If set to true, dialects that support it will use TRUNCATE instead of DELETE FROM. If a table is
   * truncated the where and limit options are ignored
   */
  truncate?: boolean;

  /**
   * Filter the destroy
   */
  where?: WhereOptions<TInstance>;
}

/**
 * Options for Model.restore
 */
export interface RestoreOptions<TInstance extends Instance> {

  /**
   * Filter the restore
   */
  where?: WhereOptions<TInstance>;

  /**
   * Run before / after bulk restore hooks?
   */
  hooks?: boolean;

  /**
   * If set to true, restore will find all records within the where parameter and will execute before / after
   * bulkRestore hooks on each row
   */
  individualHooks?: boolean;

  /**
   * How many rows to undelete
   */
  limit?: number;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

  /**
   * Transaction to run query under
   */
  transaction?: Transaction;

}

/**
 * Options used for Model.update
 */
export interface UpdateOptions<TInstance extends Instance> {

  /**
   * Options to describe the scope of the search.
   */
  where: WhereOptions<TInstance>;

  /**
   * Fields to update (defaults to all fields)
   */
  fields?: Array<keyof TInstance>;

  /**
   * Should each row be subject to validation before it is inserted. The whole insert will fail if one row
   * fails validation.
   *
   * Defaults to true
   */
  validate?: boolean;

  /**
   * Run before / after bulk update hooks?
   *
   * Defaults to true
   */
  hooks?: boolean;

  /**
   * Whether or not to update the side effects of any virtual setters.
   *
   * Defaults to true
   */
  sideEffects?: boolean;

  /**
   * Run before / after update hooks?. If true, this will execute a SELECT followed by individual UPDATEs.
   * A select is needed, because the row data needs to be passed to the hooks
   *
   * Defaults to false
   */
  individualHooks?: boolean;

  /**
   * Return the affected rows (only for postgres)
   */
  returning?: boolean;

  /**
   * How many rows to update (only for mysql and mariadb)
   */
  limit?: number;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

  /**
   * Transaction to run query under
   */
  transaction?: Transaction;

}

/**
 * Options used for Model.aggregate
 */
export interface AggregateOptions<TInstance extends Instance> extends QueryOptions {
  /** A hash of search attributes. */
  where?: WhereOptions<TInstance>;

  /**
   * The type of the result. If `field` is a field in this Model, the default will be the type of that field,
   * otherwise defaults to float.
   */
  dataType?: DataType;

  /** Applies DISTINCT to the field being aggregated over */
  distinct?: boolean;
}

// instance


/**
 * Options used for Instance.increment method
 */
export interface IncrementDecrementOptions<TInstance extends Instance> {

  /**
   * The number to increment by
   *
   * Defaults to 1
   */
  by?: number;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

  /**
   * Transaction to run query under
   */
  transaction?: Transaction;

  /**
   * A hash of attributes to describe your search. See above for examples.
   */
  where?: WhereOptions<TInstance>;

}

/**
 * Options used for Instance.restore method
 */
export interface InstanceRestoreOptions {

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

  /**
   * Transaction to run query under
   */
  transaction?: Transaction;

}

/**
 * Options used for Instance.destroy method
 */
export interface InstanceDestroyOptions {

  /**
   * If set to true, paranoid models will actually be deleted
   */
  force?: boolean;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

  /**
   * Transaction to run the query in
   */
  transaction?: Transaction;

}

/**
 * Options used for Instance.update method
 */
export interface InstanceUpdateOptions<TInstance extends Instance> extends SaveOptions<TInstance>, SetOptions {

  /**
   * A hash of attributes to describe your search. See above for examples.
   */
  where?: WhereOptions<TInstance>;

}

/**
 * Options used for Instance.set method
 */
export interface SetOptions {

  /**
   * If set to true, field and virtual setters will be ignored
   */
  raw?: boolean;

  /**
   * Clear all previously set data values
   */
  reset?: boolean;

}

/**
 * Options used for Instance.save method
 */
export interface SaveOptions<TInstance extends Instance> {

  /**
   * An optional array of strings, representing database columns. If fields is provided, only those columns
   * will be validated and saved.
   */
  fields?: Array<keyof TInstance>;

  /**
   * If true, the updatedAt timestamp will not be updated.
   *
   * Defaults to false
   */
  silent?: boolean;

  /**
   * If false, validations won't be run.
   *
   * Defaults to true
   */
  validate?: boolean;

  /**
   * A function that gets executed while running the query to log the sql.
   */
  logging?: boolean | Function;

  /**
   * Transaction to run the query in
   */
  transaction?: Transaction;
}


/**
 * Model validations, allow you to specify format/content/inheritance validations for each attribute of the
 * model.
 *
 * Validations are automatically run on create, update and save. You can also call validate() to manually
 * validate an instance.
 *
 * The validations are implemented by validator.js.
 */
export interface ModelValidateOptions {

  /**
   * is: ["^[a-z]+$",'i'] // will only allow letters
   * is: /^[a-z]+$/i      // same as the previous example using real RegExp
   */
  is?: string | Array<string | RegExp> | RegExp | { msg: string, args: string | Array<string | RegExp> | RegExp };

  /**
   * not: ["[a-z]",'i']  // will not allow letters
   */
  not?: string | Array<string | RegExp> | RegExp | { msg: string, args: string | Array<string | RegExp> | RegExp };

  /**
   * checks for email format (foo@bar.com)
   */
  isEmail?: boolean | { msg: string };

  /**
   * checks for url format (http://foo.com)
   */
  isUrl?: boolean | { msg: string };

  /**
   * checks for IPv4 (129.89.23.1) or IPv6 format
   */
  isIP?: boolean | { msg: string };

  /**
   * checks for IPv4 (129.89.23.1)
   */
  isIPv4?: boolean | { msg: string };

  /**
   * checks for IPv6 format
   */
  isIPv6?: boolean | { msg: string };

  /**
   * will only allow letters
   */
  isAlpha?: boolean | { msg: string };

  /**
   * will only allow alphanumeric characters, so "_abc" will fail
   */
  isAlphanumeric?: boolean | { msg: string };

  /**
   * will only allow numbers
   */
  isNumeric?: boolean | { msg: string };

  /**
   * checks for valid integers
   */
  isInt?: boolean | { msg: string };

  /**
   * checks for valid floating point numbers
   */
  isFloat?: boolean | { msg: string };

  /**
   * checks for any numbers
   */
  isDecimal?: boolean | { msg: string };

  /**
   * checks for lowercase
   */
  isLowercase?: boolean | { msg: string };

  /**
   * checks for uppercase
   */
  isUppercase?: boolean | { msg: string };

  /**
   * won't allow null
   */
  notNull?: boolean | { msg: string };

  /**
   * only allows null
   */
  isNull?: boolean | { msg: string };

  /**
   * don't allow empty strings
   */
  notEmpty?: boolean | { msg: string };

  /**
   * only allow a specific value
   */
  equals?: string | { msg: string };

  /**
   * force specific substrings
   */
  contains?: string | { msg: string };

  /**
   * check the value is not one of these
   */
  notIn?: Array<Array<string>> | { msg: string, args: Array<Array<string>> };

  /**
   * check the value is one of these
   */
  isIn?: Array<Array<string>> | { msg: string, args: Array<Array<string>> };

  /**
   * don't allow specific substrings
   */
  notContains?: Array<string> | string | { msg: string, args: Array<string> | string };

  /**
   * only allow values with length between 2 and 10
   */
  len?: [number, number] | { msg: string, args: [number, number] };

  /**
   * only allow uuids
   */
  isUUID?: number | { msg: string, args: number };

  /**
   * only allow date strings
   */
  isDate?: boolean | { msg: string, args: boolean };

  /**
   * only allow date strings after a specific date
   */
  isAfter?: string | { msg: string, args: string };

  /**
   * only allow date strings before a specific date
   */
  isBefore?: string | { msg: string, args: string };

  /**
   * only allow values
   */
  max?: number | { msg: string, args: number };

  /**
   * only allow values >= 23
   */
  min?: number | { msg: string, args: number };

  /**
   * only allow arrays
   */
  isArray?: boolean | { msg: string, args: boolean };

  /**
   * check for valid credit card numbers
   */
  isCreditCard?: boolean | { msg: string, args: boolean };

  /**
   * custom validations are also possible
   *
   * Implementation notes :
   *
   * We can't enforce any other method to be a function, so :
   *
   * ```typescript
   * [name: string] : ( value : any ) => boolean;
   * ```
   *
   * doesn't work in combination with the properties above
   *
   * @see https://github.com/Microsoft/TypeScript/issues/1889
   */
  [name: string]: any;

}

/**
 * Interface for indexes property in DefineOptions
 */
export interface ModelIndexesOptions<TInstance extends Instance> {

  /**
   * The name of the index. Defaults to model name + _ + fields concatenated
   */
  name?: string,

  /**
   * Index type. Only used by mysql. One of `UNIQUE`, `FULLTEXT` and `SPATIAL`
   */
  index?: string,

  /**
   * The method to create the index by (`USING` statement in SQL). BTREE and HASH are supported by mysql and
   * postgres, and postgres additionally supports GIST and GIN.
   */
  method?: string,

  /**
   * Should the index by unique? Can also be triggered by setting type to `UNIQUE`
   *
   * Defaults to false
   */
  unique?: boolean,

  /**
   * PostgreSQL will build the index without taking any write locks. Postgres only
   *
   * Defaults to false
   */
  concurrently?: boolean,

  /**
   * An array of the fields to index. Each field can either be a string containing the name of the field,
   * a sequelize object (e.g `sequelize.fn`), or an object with the following attributes: `attribute`
   * (field name), `length` (create a prefix index of length chars), `order` (the direction the column
   * should be sorted in), `collate` (the collation (sort order) for the column)
   */
  fields?: Array<keyof TInstance | { attribute: keyof TInstance, length: number, order: string, collate: string }>

}

/**
 * Interface for name property in DefineOptions
 */
export interface ModelNameOptions {

  /**
   * Singular model name
   */
  singular?: string,

  /**
   * Plural model name
   */
  plural?: string,

}

/**
 * Interface for Define Scope Options
 */
export interface ModelScopeOptions<TModel extends Model<TInstance>, TInstance extends Instance> {

  /**
   * Name of the scope and it's query
   */
  [scopeName: string]: FindOptions<TModel, TInstance> | Function;

}

/**
 * General column options
 */
export interface ColumnOptions<TColumn> {

  /**
   * If false, the column will have a NOT NULL constraint, and a not null validation will be run before an
   * instance is saved.
   */
  allowNull?: boolean;

  /**
   *  If set, sequelize will map the attribute name to a different name in the database
   */
  field?: string;

  /**
   * A literal default value, a JavaScript function, or an SQL function (see `sequelize.fn`)
   */
  defaultValue?: TColumn | Fn | Literal;

}

/**
 * References options for the column's attributes
 */
export interface ModelAttributeColumnReferencesOptions {

  /**
   * If this column references another table, provide it here as a Model, or a string
   */
  model?: string | Model<Instance>;

  /**
   * The column of the foreign table that this column references
   */
  key?: string;

  /**
   * When to check for the foreign key constraing
   *
   * PostgreSQL only
   */
  deferrable?: AbstractDeferrable;

}

/**
 * Column options for the model schema attributes
 */
export interface ModelAttributeColumnOptions<TInstance extends Instance, TAttribute> extends ColumnOptions<TAttribute> {

  /**
   * A string or a data type
   */
  type: DataType;

  /**
   * If true, the column will get a unique constraint. If a string is provided, the column will be part of a
   * composite unique index. If multiple columns have the same string, they will be part of the same unique
   * index
   */
  unique?: boolean | string | { name: string, msg: string };

  /**
   * Primary key flag
   */
  primaryKey?: boolean;

  /**
   * Is this field an auto increment field
   */
  autoIncrement?: boolean;

  /**
   * Comment for the database
   */
  comment?: string;

  /**
   * An object with reference configurations
   */
  references?: ModelAttributeColumnReferencesOptions;

  /**
   * What should happen when the referenced key is updated. One of CASCADE, RESTRICT, SET DEFAULT, SET NULL or
   * NO ACTION
   */
  onUpdate?: string;

  /**
   * What should happen when the referenced key is deleted. One of CASCADE, RESTRICT, SET DEFAULT, SET NULL or
   * NO ACTION
   */
  onDelete?: string;

  /**
   * Provide a custom getter for this column. Use `this.getDataValue(String)` to manipulate the underlying
   * values.
   */
  get?: (this: TInstance) => TAttribute;

  /**
   * Provide a custom setter for this column. Use `this.setDataValue(String, Value)` to manipulate the
   * underlying values.
   */
  set?: (this: TInstance, val: TAttribute) => void;

  /**
   * An object of validations to execute for this column every time the model is saved. Can be either the
   * name of a validation provided by validator.js, a validation function provided by extending validator.js
   * (see the
   * `DAOValidator` property for more details), or a custom validation function. Custom validation functions
   * are called with the value of the field, and can possibly take a second callback argument, to signal that
   * they are asynchronous. If the validator is sync, it should throw in the case of a failed validation, it
   * it is async, the callback should be called with the error text.
   */
  validate?: ModelValidateOptions;

  /**
   * Usage in object notation
   *
   * ```js
   * sequelize.define('model', {
   *     states: {
   *       type:   Sequelize.ENUM,
   *       values: ['active', 'pending', 'deleted']
   *     }
   *   })
   * ```
   */
  values?: TAttribute[];

}

/**
 * Interface for Attributes provided for a column
 */
export type ModelAttributes<TInstance extends Instance> = {

  /**
   * The description of a database column
   */
  [K in keyof TInstance]: DataType | ModelAttributeColumnOptions<TInstance, TInstance[K]>;
}


/**
 * Options for Model.init. We mostly duplicate the Hooks here, since there is no way to combine the two
 * interfaces.
 *
 * beforeValidate, afterValidate, beforeBulkCreate, beforeBulkDestroy, beforeBulkUpdate, beforeCreate,
 * beforeDestroy, beforeUpdate, afterCreate, afterDestroy, afterUpdate, afterBulkCreate, afterBulkDestroy and
 * afterBulkUpdate.
 */
export interface HooksOptions<TModel extends Model<TInstance>, TInstance extends Instance> {

  beforeValidate?: (instance: TInstance, options: Object) => any;
  afterValidate?: (instance: TInstance, options: Object) => any;
  beforeCreate?: (attributes: TInstance, options: CreateOptions<TModel, TInstance>) => any;
  afterCreate?: (attributes: TInstance, options: CreateOptions<TModel, TInstance>) => any;
  beforeDestroy?: (instance: TInstance, options: InstanceDestroyOptions) => any;
  beforeDelete?: (instance: TInstance, options: InstanceDestroyOptions) => any;
  afterDestroy?: (instance: TInstance, options: InstanceDestroyOptions) => any;
  afterDelete?: (instance: TInstance, options: InstanceDestroyOptions) => any;
  beforeUpdate?: (instance: TInstance, options: InstanceUpdateOptions<TInstance>) => any;
  afterUpdate?: (instance: TInstance, options: InstanceUpdateOptions<TInstance>) => any;
  beforeBulkCreate?: (instances: Array<TInstance>, options: BulkCreateOptions<TInstance>) => any;
  afterBulkCreate?: (instances: Array<TInstance>, options: BulkCreateOptions<TInstance>) => any;
  beforeBulkDestroy?: (options: DestroyOptions<TInstance>) => any;
  beforeBulkDelete?: (options: DestroyOptions<TInstance>) => any;
  afterBulkDestroy?: (options: DestroyOptions<TInstance>) => any;
  afterBulkDelete?: (options: DestroyOptions<TInstance>) => any;
  beforeBulkUpdate?: (options: UpdateOptions<TInstance>) => any;
  afterBulkUpdate?: (options: UpdateOptions<TInstance>) => any;
  beforeFind?: (options: FindOptions<TModel, TInstance>) => any;
  beforeCount?: (options: CountOptions<TModel, TInstance>) => any;
  beforeFindAfterExpandIncludeAll?: (options: FindOptions<TModel, TInstance>) => any;
  beforeFindAfterOptions?: (options: FindOptions<TModel, TInstance>) => any;
  afterFind?: (instancesOrInstance: Array<TInstance> | TInstance, options: FindOptions<TModel, TInstance>) => any;
  beforeSync?: (options: SyncOptions) => any;
  afterSync?: (options: SyncOptions) => any;
  beforeBulkSync?: (options: SyncOptions) => any;
  afterBulkSync?: (options: SyncOptions) => any;
}

/**
 * Options for model definition
 */
export interface ModelOptions<TModel extends Model<TInstance>, TInstance extends Instance> {

  /**
   * Define the default search scope to use for this model. Scopes have the same form as the options passed to
   * find / findAll.
   */
  defaultScope?: FindOptions<TModel, TInstance>;

  /**
   * More scopes, defined in the same way as defaultScope above. See `Model.scope` for more information about
   * how scopes are defined, and what you can do with them
   */
  scopes?: ModelScopeOptions<TModel, TInstance>;

  /**
   * Don't persits null values. This means that all columns with null values will not be saved.
   */
  omitNull?: boolean;

  /**
   * Adds createdAt and updatedAt timestamps to the model. Default true.
   */
  timestamps?: boolean;

  /**
   * Calling destroy will not delete the model, but instead set a deletedAt timestamp if this is true. Needs
   * timestamps=true to work. Default false.
   */
  paranoid?: boolean;

  /**
   * Converts all camelCased columns to underscored if true. Default false.
   */
  underscored?: boolean;

  /**
   * Converts camelCased model names to underscored tablenames if true. Default false.
   */
  underscoredAll?: boolean;

  /**
   * Indicates if the model's table has a trigger associated with it. Default false.
   */
  hasTrigger?: boolean;

  /**
   * If freezeTableName is true, sequelize will not try to alter the DAO name to get the table name.
   * Otherwise, the dao name will be pluralized. Default false.
   */
  freezeTableName?: boolean;

  /**
   * An object with two attributes, `singular` and `plural`, which are used when this model is associated to
   * others.
   */
  name?: ModelNameOptions;

  /**
   * Indexes for the provided database table
   */
  indexes?: ModelIndexesOptions<TInstance>[];

  /**
   * Override the name of the createdAt column if a string is provided, or disable it if false. Timestamps
   * must be true. Not affected by underscored setting.
   */
  createdAt?: string | boolean;

  /**
   * Override the name of the deletedAt column if a string is provided, or disable it if false. Timestamps
   * must be true. Not affected by underscored setting.
   */
  deletedAt?: string | boolean;

  /**
   * Override the name of the updatedAt column if a string is provided, or disable it if false. Timestamps
   * must be true. Not affected by underscored setting.
   */
  updatedAt?: string | boolean;

  /**
   * Defaults to pluralized model name, unless freezeTableName is true, in which case it uses model name
   * verbatim
   */
  tableName?: string;

  schema?: string;

  /**
   * You can also change the database engine, e.g. to MyISAM. InnoDB is the default.
   */
  engine?: string;

  charset?: string;

  /**
   * Finaly you can specify a comment for the table in MySQL and PG
   */
  comment?: string;

  collate?: string;

  /**
   * Set the initial AUTO_INCREMENT value for the table in MySQL.
   */
  initialAutoIncrement?: string;

  /**
   * An object of hook function that are called before and after certain lifecycle events.
   * The possible hooks are: beforeValidate, afterValidate, beforeBulkCreate, beforeBulkDestroy,
   * beforeBulkUpdate, beforeCreate, beforeDestroy, beforeUpdate, afterCreate, afterDestroy, afterUpdate,
   * afterBulkCreate, afterBulkDestory and afterBulkUpdate. See Hooks for more information about hook
   * functions and their signatures. Each property can either be a function, or an array of functions.
   */
  hooks?: HooksOptions<TModel, TInstance>;

  /**
   * An object of model wide validations. Validations have access to all model values via `this`. If the
   * validator function takes an argument, it is asumed to be async, and is called with a callback that
   * accepts an optional error.
   */
  validate?: ModelValidateOptions;
}

/**
 * Options passed to [[Model.init]]
 */
export interface InitOptions<TModel extends Model<TInstance>, TInstance extends Instance> extends ModelOptions<TModel, TInstance> {
  /**
   * The sequelize connection. Required ATM.
   */
  sequelize: Sequelize;
}

export interface Model<TInstance extends Instance> {

  /** The name of the database table */
  tableName: string;

  /**
   * The name of the primary key attribute
   */
  primaryKeyAttribute: string;

  /**
   * An object hash from alias to association object
   */
  associations: any;

  /**
   * The options that the model was initialized with
   */
  options: InitOptions<this, TInstance>;

  /**
   * The attributes of the model
   */
  rawAttributes: { [K in keyof TInstance]: ModelAttributeColumnOptions<TInstance, TInstance[K]> };

  /**
   * The attributes of the model
   */
  attributes: { [K in keyof TInstance]: ModelAttributeColumnOptions<TInstance, TInstance[K]> };

  /**
   * Builds a new model instance.
   * @param values an object of key value pairs
   */
  new (values?: Partial<TInstance>, options?: BuildOptions<this, TInstance>): TInstance;
  prototype: TInstance;

  /**
   * Initialize a model, representing a table in the DB, with attributes and options.
   *
   * The table columns are define by the hash that is given as the second argument. Each attribute of the hash represents a column. A short table definition might look like this:
   *
   * ```js
   * Project.init({
   *   columnA: {
   *     type: Sequelize.BOOLEAN,
   *     validate: {
   *       is: ['[a-z]','i'],        // will only allow letters
   *       max: 23,                  // only allow values <= 23
   *       isIn: {
   *         args: [['en', 'zh']],
   *         msg: "Must be English or Chinese"
   *       }
   *     },
   *     field: 'column_a'
   *     // Other attributes here
   *   },
   *   columnB: Sequelize.STRING,
   *   columnC: 'MY VERY OWN COLUMN TYPE'
   * }, {sequelize})
   *
   * sequelize.models.modelName // The model will now be available in models under the class name
   * ```
   *
   * As shown above, column definitions can be either strings, a reference to one of the datatypes that are predefined on the Sequelize constructor, or an object that allows you to specify both the type of the column, and other attributes such as default values, foreign key constraints and custom setters and getters.
   *
   * For a list of possible data types, see http://docs.sequelizejs.com/en/latest/docs/models-definition/#data-types
   *
   * For more about getters and setters, see http://docs.sequelizejs.com/en/latest/docs/models-definition/#getters-setters
   *
   * For more about instance and class methods, see http://docs.sequelizejs.com/en/latest/docs/models-definition/#expansion-of-models
   *
   * For more about validation, see http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations
   *
   * @param attributes
   *  An object, where each attribute is a column of the table. Each column can be either a DataType, a
   *  string or a type-description object, with the properties described below:
   * @param options These options are merged with the default define options provided to the Sequelize constructor
   */
  init(attributes: ModelAttributes<TInstance>, options: InitOptions<this, TInstance>): void;

  /**
   * Remove attribute from model definition
   *
   * @param attribute
   */
  removeAttribute(attribute: string): void;

  /**
   * Sync this Model to the DB, that is create the table. Upon success, the callback will be called with the
   * model instance (this)
   */
  sync(options?: SyncOptions): Promise<this>;

  /**
   * Drop the table represented by this Model
   *
   * @param options
   */
  drop(options?: DropOptions): Promise<void>;

  /**
   * Apply a schema to this model. For postgres, this will actually place the schema in front of the table
   * name
   * - `"schema"."tableName"`, while the schema will be prepended to the table name for mysql and
   * sqlite - `'schema.tablename'`.
   *
   * @param schema The name of the schema
   * @param options
   */
  schema(schema: string, options?: SchemaOptions): this;

  /**
   * Get the tablename of the model, taking schema into account. The method will return The name as a string
   * if the model has no schema, or an object with `tableName`, `schema` and `delimiter` properties.
   *
   * @param options The hash of options from any query. You can use one model to access tables with matching
   *     schemas by overriding `getTableName` and using custom key/values to alter the name of the table.
   *     (eg.
   *     subscribers_1, subscribers_2)
   * @param options.logging=false A function that gets executed while running the query to log the sql.
   */
  getTableName(options?: { logging: Function }): string | { tableName: string, schema: string, delimiter: string };

  /**
   * Apply a scope created in `define` to the model. First let's look at how to create scopes:
   * ```js
   * var Model = sequelize.define('model', attributes, {
   *   defaultScope: {
   *     where: {
   *       username: 'dan'
   *     },
   *     limit: 12
   *   },
   *   scopes: {
   *     isALie: {
   *       where: {
   *         stuff: 'cake'
   *       }
   *     },
   *     complexFunction: function(email, accessLevel) {
   *       return {
   *         where: {
   *           email: {
   *             $like: email
   *           },
   *           accesss_level {
   *             $gte: accessLevel
   *           }
   *         }
   *       }
   *     }
   *   }
   * })
   * ```
   * Now, since you defined a default scope, every time you do Model.find, the default scope is appended to
   * your query. Here's a couple of examples:
   * ```js
   * Model.findAll() // WHERE username = 'dan'
   * Model.findAll({ where: { age: { gt: 12 } } }) // WHERE age > 12 AND username = 'dan'
   * ```
   *
   * To invoke scope functions you can do:
   * ```js
   * Model.scope({ method: ['complexFunction' 'dan@sequelize.com', 42]}).findAll()
   * // WHERE email like 'dan@sequelize.com%' AND access_level >= 42
   * ```
   *
   * @return Model A reference to the model, with the scope(s) applied. Calling scope again on the returned
   *     model will clear the previous scope.
   */
  scope(options?: string | string[] | ScopeOptions | WhereAttributeHash<TInstance>): this;

  /**
   * Search for multiple instances.
   *
   * __Simple search using AND and =__
   * ```js
   * Model.findAll({
   *   where: {
   *     attr1: 42,
   *     attr2: 'cake'
   *   }
   * })
   * ```
   * ```sql
   * WHERE attr1 = 42 AND attr2 = 'cake'
   * ```
   *
   * __Using greater than, less than etc.__
   * ```js
   *
   * Model.findAll({
   *   where: {
   *     attr1: {
   *       gt: 50
   *     },
   *     attr2: {
   *       lte: 45
   *     },
   *     attr3: {
   *       in: [1,2,3]
   *     },
   *     attr4: {
   *       ne: 5
   *     }
   *   }
   * })
   * ```
   * ```sql
   * WHERE attr1 > 50 AND attr2 <= 45 AND attr3 IN (1,2,3) AND attr4 != 5
   * ```
   * Possible options are: `$ne, $in, $not, $notIn, $gte, $gt, $lte, $lt, $like, $ilike/$iLike, $notLike,
   * $notILike, '..'/$between, '!..'/$notBetween, '&&'/$overlap, '@>'/$contains, '<@'/$contained`
   *
   * __Queries using OR__
   * ```js
   * Model.findAll({
   *   where: Sequelize.and(
   *     { name: 'a project' },
   *     Sequelize.or(
   *       { id: [1,2,3] },
   *       { id: { gt: 10 } }
   *     )
   *   )
   * })
   * ```
   * ```sql
   * WHERE name = 'a project' AND (id` IN (1,2,3) OR id > 10)
   * ```
   *
   * The success listener is called with an array of instances if the query succeeds.
   *
   * @see    {Sequelize#query}
   */
  findAll(options?: FindOptions<this, TInstance>): Promise<TInstance[]>;
  all(optionz?: FindOptions<this, TInstance>): Promise<TInstance[]>;

  /**
   * Search for a single instance by its primary key. This applies LIMIT 1, so the listener will
   * always be called with a single instance.
   */
  findById(identifier?: number | string, options?: FindOptions<this, TInstance>): Promise<TInstance>;
  findByPrimary(identifier?: number | string, options?: FindOptions<this, TInstance>): Promise<TInstance>;

  /**
   * Search for a single instance. This applies LIMIT 1, so the listener will always be called with a single
   * instance.
   */
  findOne(options?: FindOptions<this, TInstance>): Promise<TInstance>;
  find(optionz?: FindOptions<this, TInstance>): Promise<TInstance>;

  /**
   * Run an aggregation method on the specified field
   *
   * @param field The field to aggregate over. Can be a field name or *
   * @param aggregateFunction The function to use for aggregation, e.g. sum, max etc.
   * @param options Query options. See sequelize.query for full options
   * @return Returns the aggregate result cast to `options.dataType`, unless `options.plain` is false, in
   *     which case the complete data result is returned.
   */
  aggregate(field: string, aggregateFunction: string, options?: AggregateOptions<TInstance>): Promise<number>;

  /**
   * Count the number of records matching the provided where clause.
   *
   * If you provide an `include` option, the number of matching associations will be counted instead.
   */
  count(options?: CountOptions<this, TInstance>): Promise<number>;

  /**
   * Find all the rows matching your query, within a specified offset / limit, and get the total number of
   * rows matching your query. This is very usefull for paging
   *
   * ```js
   * Model.findAndCountAll({
   *   where: ...,
   *   limit: 12,
   *   offset: 12
   * }).then(function (result) {
   *   ...
   * })
   * ```
   * In the above example, `result.rows` will contain rows 13 through 24, while `result.count` will return
   * the
   * total number of rows that matched your query.
   *
   * When you add includes, only those which are required (either because they have a where clause, or
   * because
   * `required` is explicitly set to true on the include) will be added to the count part.
   *
   * Suppose you want to find all users who have a profile attached:
   * ```js
   * User.findAndCountAll({
   *   include: [
   *      { model: Profile, required: true}
   *   ],
   *   limit 3
   * });
   * ```
   * Because the include for `Profile` has `required` set it will result in an inner join, and only the users
   * who have a profile will be counted. If we remove `required` from the include, both users with and
   * without
   * profiles will be counted
   */
  findAndCount(options?: FindAndCountOptions<this, TInstance>): Promise<{ rows: TInstance[], count: number }>;
  findAndCountAll(options?: FindAndCountOptions<this, TInstance>): Promise<{ rows: TInstance[], count: number }>;

  /**
   * Find the maximum value of field
   */
  max(field: string, options?: AggregateOptions<TInstance>): Promise<any>;

  /**
   * Find the minimum value of field
   */
  min(field: string, options?: AggregateOptions<TInstance>): Promise<any>;

  /**
   * Find the sum of field
   */
  sum(field: string, options?: AggregateOptions<TInstance>): Promise<number>;

  /**
   * Builds a new model instance. Values is an object of key value pairs, must be defined but can be empty.
   */
  build(record?: Partial<TInstance>, options?: BuildOptions<this, TInstance>): TInstance;

  /**
   * Undocumented bulkBuild
   */
  bulkBuild(records: Partial<TInstance>[], options?: BuildOptions<this, TInstance>): TInstance;

  /**
   * Builds a new model instance and calls save on it.
   */
  create(values?: Partial<TInstance>, options?: CreateOptions<this, TInstance>): Promise<TInstance[]>;

  /**
   * Find a row that matches the query, or build (but don't save) the row if none is found.
   * The successfull result of the promise will be (instance, initialized) - Make sure to use .spread()
   */
  findOrInitialize(options: FindOrInitializeOptions<TInstance>): Promise<TInstance>;
  findOrBuild(options: FindOrInitializeOptions<TInstance>): Promise<TInstance>;

  /**
   * Find a row that matches the query, or build and save the row if none is found
   * The successful result of the promise will be (instance, created) - Make sure to use .spread()
   *
   * If no transaction is passed in the `options` object, a new transaction will be created internally, to
   * prevent the race condition where a matching row is created by another connection after the find but
   * before the insert call. However, it is not always possible to handle this case in SQLite, specifically
   * if one transaction inserts and another tries to select before the first one has comitted. In this case,
   * an instance of sequelize.TimeoutError will be thrown instead. If a transaction is created, a savepoint
   * will be created instead, and any unique constraint violation will be handled internally.
   */
  findOrCreate(options: FindOrInitializeOptions<TInstance>): Promise<TInstance>;

  /**
   * Insert or update a single row. An update will be executed if a row which matches the supplied values on
   * either the primary key or a unique key is found. Note that the unique index must be defined in your
   * sequelize model and not just in the table. Otherwise you may experience a unique constraint violation,
   * because sequelize fails to identify the row that should be updated.
   *
   * **Implementation details:**
   *
   * * MySQL - Implemented as a single query `INSERT values ON DUPLICATE KEY UPDATE values`
   * * PostgreSQL - Implemented as a temporary function with exception handling: INSERT EXCEPTION WHEN
   *   unique_constraint UPDATE
   * * SQLite - Implemented as two queries `INSERT; UPDATE`. This means that the update is executed
   * regardless
   *   of whether the row already existed or not
   *
   * **Note** that SQLite returns undefined for created, no matter if the row was created or updated. This is
   * because SQLite always runs INSERT OR IGNORE + UPDATE, in a single query, so there is no way to know
   * whether the row was inserted or not.
   */
  upsert(values: Partial<TInstance>, options?: UpsertOptions<TInstance>): Promise<boolean>;
  insertOrUpdate(values: Partial<TInstance>, options?: UpsertOptions<TInstance>): Promise<boolean>;

  /**
   * Create and insert multiple instances in bulk.
   *
   * The success handler is passed an array of instances, but please notice that these may not completely
   * represent the state of the rows in the DB. This is because MySQL and SQLite do not make it easy to
   * obtain
   * back automatically generated IDs and other default values in a way that can be mapped to multiple
   * records. To obtain Instances for the newly created values, you will need to query for them again.
   *
   * @param records List of objects (key/value pairs) to create instances from
   */
  bulkCreate(records: Partial<TInstance[]>, options?: BulkCreateOptions<TInstance>): Promise<TInstance[]>;

  /**
   * Truncate all instances of the model. This is a convenient method for Model.destroy({ truncate: true }).
   */
  truncate(options?: TruncateOptions): Promise<void>;

  /**
   * Delete multiple instances, or set their deletedAt timestamp to the current time if `paranoid` is enabled.
   *
   * @return Promise<number> The number of destroyed rows
   */
  destroy(options?: DestroyOptions<TInstance>): Promise<number>;

  /**
   * Restore multiple instances if `paranoid` is enabled.
   */
  restore(options?: RestoreOptions<TInstance>): Promise<void>;

  /**
   * Update multiple instances that match the where options. The promise returns an array with one or two
   * elements. The first element is always the number of affected rows, while the second element is the actual
   * affected rows (only supported in postgres with `options.returning` true.)
   */
  update(values: Partial<TInstance>, options: UpdateOptions<TInstance>): Promise<[number, TInstance[]]>;

  /**
   * Run a describe query on the table. The result will be return to the listener as a hash of attributes and
   * their types.
   */
  describe(): Promise<{ [K in keyof TInstance]: any }>;

  /**
   * Unscope the model
   */
  unscoped(): this;

  /**
   * Add a hook to the model
   *
   * @param hookType
   * @param name Provide a name for the hook function. It can be used to remove the hook later or to order
   *     hooks based on some sort of priority system in the future.
   * @param fn The hook function
   *
   * @alias hook
   */
  addHook(hookType: string, name: string, fn: Function): this;
  addHook(hookType: string, fn: Function): this;
  hook(hookType: string, name: string, fn: Function): this;
  hook(hookType: string, fn: Function): this;

  /**
   * Remove hook from the model
   *
   * @param hookType
   * @param name
   */
  removeHook(hookType: string, name: string): this;

  /**
   * Check whether the mode has any hooks of this type
   *
   * @param hookType
   *
   * @alias hasHooks
   */
  hasHook(hookType: string): boolean;
  hasHooks(hookType: string): boolean;

  /**
   * A hook that is run before validation
   *
   * @param name
   * @param fn A callback function that is called with instance, options
   */
  beforeValidate(name: string, fn: (instance: TInstance, options: Object) => void): void;
  beforeValidate(fn: (instance: TInstance, options: Object) => void): void;

  /**
   * A hook that is run after validation
   *
   * @param name
   * @param fn A callback function that is called with instance, options
   */
  afterValidate(name: string, fn: (instance: TInstance, options: Object) => void): void;
  afterValidate(fn: (instance: TInstance, options: Object) => void): void;

  /**
   * A hook that is run before creating a single instance
   *
   * @param name
   * @param fn A callback function that is called with attributes, options
   */
  beforeCreate(name: string, fn: (attributes: TInstance, options: CreateOptions<this, TInstance>) => void): void;
  beforeCreate(fn: (attributes: TInstance, options: CreateOptions<this, TInstance>) => void): void;

  /**
   * A hook that is run after creating a single instance
   *
   * @param name
   * @param fn A callback function that is called with attributes, options
   */
  afterCreate(name: string, fn: (attributes: TInstance, options: CreateOptions<this, TInstance>) => void): void;
  afterCreate(fn: (attributes: TInstance, options: CreateOptions<this, TInstance>) => void): void;

  /**
   * A hook that is run before destroying a single instance
   *
   * @param name
   * @param fn A callback function that is called with instance, options
   * @alias beforeDelete
   */
  beforeDestroy(name: string, fn: (instance: TInstance, options: InstanceDestroyOptions) => void): void;
  beforeDestroy(fn: (instance: TInstance, options: InstanceDestroyOptions) => void): void;
  beforeDelete(name: string, fn: (instance: TInstance, options: InstanceDestroyOptions) => void): void;
  beforeDelete(fn: (instance: TInstance, options: InstanceDestroyOptions) => void): void;

  /**
   * A hook that is run after destroying a single instance
   *
   * @param name
   * @param fn A callback function that is called with instance, options
   * @alias afterDelete
   */
  afterDestroy(name: string, fn: (instance: TInstance, options: InstanceDestroyOptions) => void): void;
  afterDestroy(fn: (instance: TInstance, options: InstanceDestroyOptions) => void): void;
  afterDelete(name: string, fn: (instance: TInstance, options: InstanceDestroyOptions) => void): void;
  afterDelete(fn: (instance: TInstance, options: InstanceDestroyOptions) => void): void;

  /**
   * A hook that is run before updating a single instance
   *
   * @param name
   * @param fn A callback function that is called with instance, options
   */
  beforeUpdate(name: string, fn: (instance: TInstance, options: UpdateOptions<TInstance>) => void): void;
  beforeUpdate(fn: (instance: TInstance, options: UpdateOptions<TInstance>) => void): void;

  /**
   * A hook that is run after updating a single instance
   *
   * @param name
   * @param fn A callback function that is called with instance, options
   */
  afterUpdate(name: string, fn: (instance: TInstance, options: UpdateOptions<TInstance>) => void): void;
  afterUpdate(fn: (instance: TInstance, options: UpdateOptions<TInstance>) => void): void;

  /**
   * A hook that is run before creating instances in bulk
   *
   * @param name
   * @param fn A callback function that is called with instances, options
   */
  beforeBulkCreate(name: string, fn: (instances: this[], options: BulkCreateOptions<TInstance>) => void): void;
  beforeBulkCreate(fn: (instances: this[], options: BulkCreateOptions<TInstance>) => void): void;

  /**
   * A hook that is run after creating instances in bulk
   *
   * @param name
   * @param fn A callback function that is called with instances, options
   * @name afterBulkCreate
   */
  afterBulkCreate(name: string, fn: (instances: this[], options: BulkCreateOptions<TInstance>) => void): void;
  afterBulkCreate(fn: (instances: this[], options: BulkCreateOptions<TInstance>) => void): void;

  /**
   * A hook that is run before destroying instances in bulk
   *
   * @param name
   * @param fn   A callback function that is called with options
   *
   * @alias beforeBulkDelete
   */
  beforeBulkDestroy(name: string, fn: (options: DestroyOptions<TInstance>) => void): void;
  beforeBulkDestroy(fn: (options: DestroyOptions<TInstance>) => void): void;
  beforeBulkDelete(name: string, fn: (options: DestroyOptions<TInstance>) => void): void;
  beforeBulkDelete(fn: (options: DestroyOptions<TInstance>) => void): void;

  /**
   * A hook that is run after destroying instances in bulk
   *
   * @param name
   * @param fn   A callback function that is called with options
   *
   * @alias afterBulkDelete
   */
  afterBulkDestroy(name: string, fn: (options: DestroyOptions<TInstance>) => void): void;
  afterBulkDestroy(fn: (options: DestroyOptions<TInstance>) => void): void;
  afterBulkDelete(name: string, fn: (options: DestroyOptions<TInstance>) => void): void;
  afterBulkDelete(fn: (options: DestroyOptions<TInstance>) => void): void;

  /**
   * A hook that is run after updating instances in bulk
   *
   * @param name
   * @param fn   A callback function that is called with options
   */
  beforeBulkUpdate(name: string, fn: (options: UpdateOptions<TInstance>) => void): void;
  beforeBulkUpdate(fn: (options: UpdateOptions<TInstance>) => void): void;

  /**
   * A hook that is run after updating instances in bulk
   *
   * @param name
   * @param fn   A callback function that is called with options
   */
  afterBulkUpdate(name: string, fn: (options: UpdateOptions<TInstance>) => void): void;
  afterBulkUpdate(fn: (options: UpdateOptions<TInstance>) => void): void;

  /**
   * A hook that is run before a find (select) query
   *
   * @param name
   * @param fn   A callback function that is called with options
   */
  beforeFind(name: string, fn: (options: FindOptions<this, TInstance>) => void): void;
  beforeFind(fn: (options: FindOptions<this, TInstance>) => void): void;

  /**
   * A hook that is run before a count query
   *
   * @param name
   * @param fn   A callback function that is called with options
   */
  beforeCount(name: string, fn: (options: CountOptions<this, TInstance>) => void): void;
  beforeCount(fn: (options: CountOptions<this, TInstance>) => void): void;

  /**
   * A hook that is run before a find (select) query, after any { include: {all: ...} } options are expanded
   *
   * @param name
   * @param fn   A callback function that is called with options
   */
  beforeFindAfterExpandIncludeAll(name: string, fn: (options: FindOptions<this, TInstance>) => void): void;
  beforeFindAfterExpandIncludeAll(fn: (options: FindOptions<this, TInstance>) => void): void;

  /**
   * A hook that is run before a find (select) query, after all option parsing is complete
   *
   * @param name
   * @param fn   A callback function that is called with options
   */
  beforeFindAfterOptions(name: string, fn: (options: FindOptions<this, TInstance>) => void): void;
  beforeFindAfterOptions(fn: (options: FindOptions<this, TInstance>) => void): void;

  /**
   * A hook that is run after a find (select) query
   *
   * @param name
   * @param fn   A callback function that is called with instance(s), options
   */
  afterFind(name: string, fn: (instancesOrinstance: TInstance[] | TInstance, options: FindOptions<this, TInstance>, fn?: Function) => void): void;
  afterFind(fn: (instancesOrinstance: TInstance[] | TInstance, options: FindOptions<this, TInstance>,
    fn?: Function) => void): void;

  /**
   * A hook that is run before a define call
   *
   * @param name
   * @param fn   A callback function that is called with attributes, options
   */
  beforeDefine(name: string, fn: (attributes: ModelAttributes<TInstance>, options: ModelOptions<this, TInstance>) => void): void;
  beforeDefine(fn: (attributes: ModelAttributes<TInstance>, options: ModelOptions<this, TInstance>) => void): void;

  /**
   * A hook that is run after a define call
   *
   * @param name
   * @param fn   A callback function that is called with factory
   */
  afterDefine(name: string, fn: (model: this) => void): void;
  afterDefine(fn: (model: this) => void): void;

  /**
   * A hook that is run before Sequelize() call
   *
   * @param name
   * @param fn   A callback function that is called with config, options
   */
  beforeInit(name: string, fn: (config: Object, options: Object) => void): void;
  beforeInit(fn: (config: Object, options: Object) => void): void;

  /**
   * A hook that is run after Sequelize() call
   *
   * @param name
   * @param fn   A callback function that is called with sequelize
   */
  afterInit(name: string, fn: (sequelize: Sequelize) => void): void;
  afterInit(fn: (sequelize: Sequelize) => void): void;

  /**
   * A hook that is run before sequelize.sync call
   * @param {String}   name
   * @param {Function} fn   A callback function that is called with options passed to sequelize.sync
   * @name beforeBulkSync
   */
  beforeBulkSync(name: string, fn: (options: SyncOptions) => any): void;
  beforeBulkSync(fn: (options: SyncOptions) => any): void;

  /**
   * A hook that is run after sequelize.sync call
   * @param {String}   name
   * @param {Function} fn   A callback function that is called with options passed to sequelize.sync
   * @name afterBulkSync
   */
  afterBulkSync(name: string, fn: (options: SyncOptions) => any): void;
  afterBulkSync(fn: (options: SyncOptions) => any): void;

  /**
   * A hook that is run before Model.sync call
   * @param {String}   name
   * @param {Function} fn   A callback function that is called with options passed to Model.sync
   * @name beforeSync
   */
  beforeSync(name: string, fn: (options: SyncOptions) => any): void;
  beforeSync(fn: (options: SyncOptions) => any): void;

  /**
   * A hook that is run after Model.sync call
   * @param {String}   name
   * @param {Function} fn   A callback function that is called with options passed to Model.sync
   * @name afterSync
   */
  afterSync(name: string, fn: (options: SyncOptions) => any): void;
  afterSync(fn: (options: SyncOptions) => any): void;

  /**
   * Creates an association between this (the source) and the provided target. The foreign key is added
   * on the target.
   *
   * Example: `User.hasOne(Profile)`. This will add userId to the profile table.
   *
   * @param target The model that will be associated with hasOne relationship
   * @param options Options for the association
   */
  hasOne<TTarget extends Model<Instance>>(target: TTarget, options?: HasOneOptions): HasOne<this, TTarget>;

  /**
   * Creates an association between this (the source) and the provided target. The foreign key is added on the
   * source.
   *
   * Example: `Profile.belongsTo(User)`. This will add userId to the profile table.
   *
   * @param target The model that will be associated with hasOne relationship
   * @param options Options for the association
   */
  belongsTo<TTarget extends Model<Instance>>(target: TTarget, options?: BelongsToOptions): BelongsTo<this, TTarget>;

  /**
   * Create an association that is either 1:m or n:m.
   *
   * ```js
   * // Create a 1:m association between user and project
   * User.hasMany(Project)
   * ```
   * ```js
   * // Create a n:m association between user and project
   * User.hasMany(Project)
   * Project.hasMany(User)
   * ```
   * By default, the name of the join table will be source+target, so in this case projectsusers. This can be
   * overridden by providing either a string or a Model as `through` in the options. If you use a through
   * model with custom attributes, these attributes can be set when adding / setting new associations in two
   * ways. Consider users and projects from before with a join table that stores whether the project has been
   * started yet:
   * ```js
   * var UserProjects = sequelize.define('userprojects', {
   *   started: Sequelize.BOOLEAN
   * })
   * User.hasMany(Project, { through: UserProjects })
   * Project.hasMany(User, { through: UserProjects })
   * ```
   * ```js
   * jan.addProject(homework, { started: false }) // The homework project is not started yet
   * jan.setProjects([makedinner, doshopping], { started: true}) // Both shopping and dinner have been
   * started
   * ```
   *
   * If you want to set several target instances, but with different attributes you have to set the
   * attributes on the instance, using a property with the name of the through model:
   *
   * ```js
   * p1.userprojects {
   *   started: true
   * }
   * user.setProjects([p1, p2], {started: false}) // The default value is false, but p1 overrides that.
   * ```
   *
   * Similarily, when fetching through a join table with custom attributes, these attributes will be
   * available as an object with the name of the through model.
   * ```js
   * user.getProjects().then(function (projects) {
   *   var p1 = projects[0]
   *   p1.userprojects.started // Is this project started yet?
   * })
   * ```
   *
   * @param target The model that will be associated with hasOne relationship
   * @param options Options for the association
   */
  hasMany<TTarget extends Model<Instance>>(target: TTarget, options?: HasManyOptions): HasMany<this, TTarget>;

  /**
   * Create an N:M association with a join table
   *
   * ```js
   * User.belongsToMany(Project)
   * Project.belongsToMany(User)
   * ```
   * By default, the name of the join table will be source+target, so in this case projectsusers. This can be
   * overridden by providing either a string or a Model as `through` in the options.
   *
   * If you use a through model with custom attributes, these attributes can be set when adding / setting new
   * associations in two ways. Consider users and projects from before with a join table that stores whether
   * the project has been started yet:
   * ```js
   * var UserProjects = sequelize.define('userprojects', {
   *   started: Sequelize.BOOLEAN
   * })
   * User.belongsToMany(Project, { through: UserProjects })
   * Project.belongsToMany(User, { through: UserProjects })
   * ```
   * ```js
   * jan.addProject(homework, { started: false }) // The homework project is not started yet
   * jan.setProjects([makedinner, doshopping], { started: true}) // Both shopping and dinner has been started
   * ```
   *
   * If you want to set several target instances, but with different attributes you have to set the
   * attributes on the instance, using a property with the name of the through model:
   *
   * ```js
   * p1.userprojects {
   *   started: true
   * }
   * user.setProjects([p1, p2], {started: false}) // The default value is false, but p1 overrides that.
   * ```
   *
   * Similarily, when fetching through a join table with custom attributes, these attributes will be
   * available as an object with the name of the through model.
   * ```js
   * user.getProjects().then(function (projects) {
   *   var p1 = projects[0]
   *   p1.userprojects.started // Is this project started yet?
   * })
   * ```
   *
   * @param target The model that will be associated with hasOne relationship
   * @param options Options for the association
   *
   */
  belongsToMany<TTarget extends Model<Instance>>(target: TTarget, options: BelongsToManyOptions): BelongsToMany<this, TTarget>;
}

// Not using a generic TModel parameter here to avoid a cyclic type reference
export interface Instance {

  constructor: Model<this>;

  /**
   * Returns true if this instance has not yet been persisted to the database
   */
  isNewRecord: boolean;

  /**
   * A reference to the sequelize instance
   */
  sequelize: Sequelize;

  /**
   * Get an object representing the query for this instance, use with `options.where`
   */
  where(): WhereOptions<this>;

  /**
   * Get the value of the underlying data value
   */
  getDataValue<K extends keyof this>(key: K): this[K];

  /**
   * Update the underlying data value
   */
  setDataValue<K extends keyof this>(key: K, value: this[K]): void;

  /**
   * If no key is given, returns all values of the instance, also invoking virtual getters.
   *
   * If key is given and a field or virtual getter is present for the key it will call that getter - else it
   * will return the value for key.
   *
   * @param options.plain If set to true, included instances will be returned as plain objects
   */
  get(options?: { plain?: boolean, clone?: boolean }): { [K in keyof this]: this[K] };
  get<K extends keyof this>(key: K, options?: { plain?: boolean, clone?: boolean }): this[K];

  /**
   * Set is used to update values on the instance (the sequelize representation of the instance that is,
   * remember that nothing will be persisted before you actually call `save`). In its most basic form `set`
   * will update a value stored in the underlying `dataValues` object. However, if a custom setter function
   * is defined for the key, that function will be called instead. To bypass the setter, you can pass `raw:
   * true` in the options object.
   *
   * If set is called with an object, it will loop over the object, and call set recursively for each key,
   * value pair. If you set raw to true, the underlying dataValues will either be set directly to the object
   * passed, or used to extend dataValues, if dataValues already contain values.
   *
   * When set is called, the previous value of the field is stored and sets a changed flag(see `changed`).
   *
   * Set can also be used to build instances for associations, if you have values for those.
   * When using set with associations you need to make sure the property key matches the alias of the
   * association while also making sure that the proper include options have been set (from .build() or
   * .find())
   *
   * If called with a dot.seperated key on a JSON/JSONB attribute it will set the value nested and flag the
   * entire object as changed.
   *
   * @param options.raw If set to true, field and virtual setters will be ignored
   * @param options.reset Clear all previously set data values
   */
  set<K extends keyof this>(key: K, value: this[K], options?: SetOptions): this;
  set(keys: Partial<this>, options?: SetOptions): this;
  setAttributes<K extends keyof this>(key: K, value: this[K], options?: SetOptions): this;
  setAttributes(keys: Partial<this>, options?: SetOptions): this;

  /**
   * If changed is called with a string it will return a boolean indicating whether the value of that key in
   * `dataValues` is different from the value in `_previousDataValues`.
   *
   * If changed is called without an argument, it will return an array of keys that have changed.
   *
   * If changed is called with two arguments, it will set the property to `dirty`.
   *
   * If changed is called without an argument and no keys have changed, it will return `false`.
   */
  changed(key: keyof this): boolean;
  changed(key: keyof this, dirty: boolean): void;
  changed(): boolean | Array<keyof this>;

  /**
   * Returns the previous value for key from `_previousDataValues`.
   */
  previous<K extends keyof this>(key: K): this[K];

  /**
   * Validate this instance, and if the validation passes, persist it to the database.
   *
   * On success, the callback will be called with this instance. On validation error, the callback will be
   * called with an instance of `Sequelize.ValidationError`. This error will have a property for each of the
   * fields for which validation failed, with the error message for that field.
   */
  save(options?: SaveOptions<this>): Promise<this>;

  /**
   * Refresh the current instance in-place, i.e. update the object with current data from the DB and return
   * the same object. This is different from doing a `find(Instance.id)`, because that would create and
   * return a new instance. With this method, all references to the Instance are updated with the new data
   * and no new objects are created.
   */
  reload(options?: FindOptions<Model<this>, this>): Promise<this>;

  /**
   * Validate the attribute of this instance according to validation rules set in the model definition.
   *
   * Emits null if and only if validation successful; otherwise an Error instance containing
   * { field name : [error msgs] } entries.
   *
   * @param options Options that are passed to the validator
   */
  validate(options?: { skip?: string[], fields?: string[] }): Promise<ValidationError>;

  /**
   * This is the same as calling `set` and then calling `save`.
   */
  update<K extends keyof this>(key: K, value: this[K], options?: InstanceUpdateOptions<this>): Promise<this>;
  update(keys: Partial<this>, options?: InstanceUpdateOptions<this>): Promise<this>;
  updateAttributes<K extends keyof this>(key: K, value: this[K], options?: InstanceUpdateOptions<this>): Promise<this>;
  updateAttributes(keys: Partial<this>, options?: InstanceUpdateOptions<this>): Promise<this>;

  /**
   * Destroy the row corresponding to this instance. Depending on your setting for paranoid, the row will
   * either be completely deleted, or have its deletedAt timestamp set to the current time.
   */
  destroy(options?: InstanceDestroyOptions): Promise<void>;

  /**
   * Restore the row corresponding to this instance. Only available for paranoid models.
   */
  restore(options?: InstanceRestoreOptions): Promise<void>;

  /**
   * Increment the value of one or more columns. This is done in the database, which means it does not use
   * the values currently stored on the Instance. The increment is done using a
   * ```sql
   * SET column = column + X
   * ```
   * query. To get the correct value after an increment into the Instance you should do a reload.
   *
   * ```js
   * instance.increment('number') // increment number by 1
   * instance.increment(['number', 'count'], { by: 2 }) // increment number and count by 2
   * instance.increment({ answer: 42, tries: 1}, { by: 2 }) // increment answer by 42, and tries by 1.
   *                                                        // `by` is ignored, since each column has its own
   *                                                        // value
   * ```
   *
   * @param fields If a string is provided, that column is incremented by the value of `by` given in options.
   *               If an array is provided, the same is true for each column.
   *               If and object is provided, each column is incremented by the value given.
   */
  increment(fields: keyof this | (keyof this)[] | { [K in keyof this]?: number }, options?: IncrementDecrementOptions<this>): Promise<this>;

  /**
   * Decrement the value of one or more columns. This is done in the database, which means it does not use
   * the values currently stored on the Instance. The decrement is done using a
   * ```sql
   * SET column = column - X
   * ```
   * query. To get the correct value after an decrement into the Instance you should do a reload.
   *
   * ```js
   * instance.decrement('number') // decrement number by 1
   * instance.decrement(['number', 'count'], { by: 2 }) // decrement number and count by 2
   * instance.decrement({ answer: 42, tries: 1}, { by: 2 }) // decrement answer by 42, and tries by 1.
   *                                                        // `by` is ignored, since each column has its own
   *                                                        // value
   * ```
   *
   * @param fields If a string is provided, that column is decremented by the value of `by` given in options.
   *               If an array is provided, the same is true for each column.
   *               If and object is provided, each column is decremented by the value given
   */
  decrement(fields: keyof this | (keyof this)[] | { [K in keyof this]?: number }, options?: IncrementDecrementOptions<this>): Promise<this>;

  /**
   * Check whether all values of this and `other` Instance are the same
   */
  equals(other: this): boolean;

  /**
   * Check if this is eqaul to one of `others` by calling equals
   */
  equalsOneOf(others: this[]): boolean;

  /**
   * Convert the instance to a JSON representation. Proxies to calling `get` with no keys. This means get all
   * values gotten from the DB, and apply all custom getters.
   */
  toJSON(): { [K in keyof this]: this[K] };
}

export const Model: Model<Instance>;
export default Model;

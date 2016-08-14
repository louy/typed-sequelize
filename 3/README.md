# Typed Sequelize@3
[![Build Status](https://travis-ci.org/louy/typed-sequelize.svg?branch=master)](https://travis-ci.org/louy/typed-sequelize)

## [API Documentation](http://typed-sequelize.surge.sh/v3)

## Usage

First, install:
```bash
typings install --save sequelize
```

To create a model:

```ts
/** models/thing.ts */
import * as Sequelize from 'sequelize';
import sequelize from '../connection'; // A Sequelize instance

interface Thing { // interface used to create/update an instance
  id?: number;
  name?: string;
}
interface ThingInstance extends Sequelize.Instance<ThingInstance, Thing> { // an instance
  id: number;

  // you should add all instance methods here
  doSomething(): any;
}
const Thing = sequelize.define<ThingInstance, Thing>('thing', {
  name: Sequelize.STRING,
}, {
  instanceMethods: {
    doSomething() {
      // whatever...
    }
  },
});

export default Thing;
export {ThingInstance};

```

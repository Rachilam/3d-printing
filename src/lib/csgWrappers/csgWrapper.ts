import _ from 'lodash';
import {
  union,
  difference,
} from '../jscadApiWrapper';

interface BaseOptions {
  name?: string;
}

interface CsgOptions extends BaseOptions {
  csg: Csg;
}

interface WrapperOptions extends BaseOptions {
  wrapper: CsgWrapper;
}

type CsgWrapperOptons = CsgOptions | WrapperOptions;

interface Position {
  x: number,
  y: number,
  z: number,
}

export class CsgWrapper {
  name: string;
  position: Position;
  _csg: Csg;

  constructor(options: CsgWrapperOptons) {
    this.name = options.name;
    this.csg = 'csg' in options ? options.csg : options.wrapper.csg;
    this.position = {
      x: 0,
      y: 0,
      z: 0,
    };
  }

  static union (...csgWrappers: CsgWrapper[]) {
    const csgs = csgWrappers.map(({ csg }) => csg)
      .filter((csg) => csg !== null);
    return new CsgWrapper({ csg: union(...csgs) });
  }

  static difference(...csgWrappers: CsgWrapper[]) {
    const csgs = csgWrappers.map(({ csg }) => csg)
      .filter((csg) => csg !== null);

    return new CsgWrapper({
      csg: csgs.length > 0
        ? difference(...csgs)
        : null,
    });
  }

  get csg() {
    return this._csg;
  }

  set csg(value) {
    this._csg = _.isNil(value) ? null : value;
  }

  copy() {
    return new CsgWrapper({ csg: this.csg });
  }

  translate(xDistance: number, yDistance: number, zDistance: number) {
    this.position.x += xDistance;
    this.position.y += yDistance;
    this.position.z += zDistance;
    this.csg = this.csg?.translate([xDistance, yDistance, zDistance]);
    return this;
  }

  translateXY(xDistance: number, yDistance: number) {
    return this.translate(xDistance, yDistance, 0);
  }

  translateXZ(xDistance: number, zDistance: number) {
    return this.translate(xDistance, 0, zDistance);
  }

  translateYZ(yDistance: number, zDistance: number,) {
    return this.translate(0, yDistance, zDistance);
  }

  translateX(distance: number) {
    return this.translate(distance, 0, 0);
  }

  translateY(distance: number) {
    return this.translate(0, distance, 0);
  }

  translateZ(distance: number) {
    return this.translate(0, 0, distance);
  }

  centerXY() {
    this.csg = this.csg?.center([true, true, false]);
    return this;
  }

  union(...csgWrappers: CsgWrapper[]) {
    return CsgWrapper.union(this, ...csgWrappers);
  }

  difference(...csgWrappers: CsgWrapper[]) {
    return CsgWrapper.difference(this, ...csgWrappers);
  }

  tap(callback: Function) {
    callback(this);
    return this;
  }

  log(data = {}) {
    console.log(`${this.name}:`, {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
      ...data,
    });

    return this;
  }
}

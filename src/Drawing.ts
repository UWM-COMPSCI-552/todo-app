import { Shape, ShapeFactory  } from './Shape';

export type Drawing = Shape[];

export function drawingFromJSON(json : unknown) : Drawing {
    if (!Array.isArray(json)) throw new Error(`bad Drawing`);
    const result : Drawing = [];
    for (const sh of json as unknown[]) {
        result.push(ShapeFactory.fromJSON(sh));
    }
    return result;
}
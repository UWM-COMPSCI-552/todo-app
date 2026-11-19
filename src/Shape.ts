export interface Delta {
    dx : number;
    dy : number;
}

export interface Rect {
    center : {x:number, y:number};
    width : number;
    height : number;
}

export const SELECT_RADIUS = 2;

export interface Shape {
    draw : (ctx:CanvasRenderingContext2D, selected?:boolean) => void;
    move : (delta : Delta) => void;
    setStroke : (color:string) => void;
    overlaps : (r:Rect) => boolean;
    fromJSON : (props:object) => void;
}

export abstract class ShapeFactory {
    className : string;
    abstract create() : Shape;

    constructor(name : string) {
        this.className = name;
    }

    private static allFactories : Map<string, ShapeFactory> = new Map();

    public static register(f:ShapeFactory) {
        this.allFactories.set(f.className, f);
    }

    public static fromJSON(json : unknown) : Shape {
        if (typeof json !== "object" || json === null) throw new Error("bad JSON");
        if ("class" in json && typeof json.class === "string") {
            const f = this.allFactories.get(json.class);
            if (f !== undefined) {
                const result = f.create();
                result.fromJSON(json); 
                return result;
            }
        }
        throw new Error("bad JSON");
    }
}

export
abstract class AbstractShape implements Shape {
    abstract setStroke(color:string) : void;
    abstract draw(ctx:CanvasRenderingContext2D) : void;
    abstract move(delta:Delta) : void;
    abstract overlaps(r:Rect) : boolean;
    abstract fromJSON(props:object) : void;
}

export class Group extends AbstractShape {
    private shapes : Shape[];

    constructor (...shs : Shape[]) {
        super();
        this.shapes = shs;
    }

    override setStroke(color : string) {
        for (const sh of this.shapes) {
            sh.setStroke(color);
        }
    }
    
    override move(d : Delta) : void {
        for (const sh of this.shapes) {
            sh.move(d);
        }
    }

    override draw(ctx:CanvasRenderingContext2D, selected?:boolean) : void {
        for (const sh of this.shapes) {
            sh.draw(ctx,selected);
        }
    }

    override overlaps(r: Rect): boolean {
        for (const sh of this.shapes) {
            if (sh.overlaps(r)) return true;
        }
        return false;
    }

    toJSON() : object {
        return {class: "Group", shapes: [...this.shapes]};
    }

    override fromJSON(props:object) {
        if ("shapes" in props && Array.isArray(props.shapes)) {
            for (const j of props.shapes as unknown[]) {
                this.shapes.push(ShapeFactory.fromJSON(j));
            }
        }
    }
}
ShapeFactory.register({
    className : "Group",
    create : () => new Group()
})

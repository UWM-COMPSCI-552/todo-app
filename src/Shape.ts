export interface Delta {
    dx : number;
    dy : number;
}

export interface Rect {
    center : {x:number, y:number};
    width : number;
    height : number;
}

export interface Shape {
    draw : (ctx:CanvasRenderingContext2D, selected?:boolean) => void;
    move : (delta : Delta) => void;
    setStroke : (color:string) => void;
    overlaps : (r:Rect) => boolean;
}

export
abstract class AbstractShape implements Shape {
    abstract setStroke(color:string) : void;
    abstract draw(ctx:CanvasRenderingContext2D) : void;
    abstract move(delta:Delta) : void;
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
}

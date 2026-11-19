import { Point } from './Point';
import { AbstractShape, Delta, Rect, SELECT_RADIUS, ShapeFactory } from './Shape';

abstract class DefaultShape extends AbstractShape {

    protected center : Point;
    protected strokeColor : string;

    constructor (center : Point, color : string) {
        super();
        this.center = center;
        this.strokeColor = color;
    }

    public setCenter (c:Point) {
        this.center = c;
    }

    setStroke(color: string): void {
        this.strokeColor = color;
    }

    move(delta: Delta): void {
        this.center = new Point(this.center.getX() + delta.dx, this.center.getY() + delta.dy);
    }

    public draw(ctx : CanvasRenderingContext2D) : void {
        ctx.strokeStyle = this.strokeColor;
    }

    public toJSON() : { class: string, center : object, stroke: string } {
        return { class: this.constructor.name, center: this.center.toJSON, stroke: this.strokeColor };
    }

    override fromJSON (props : object) {
        if ("center" in props) {
            this.center = Point.fromJSON(props.center);
        }
        if ("stroke" in props && typeof props.stroke === "string") {
            this.strokeColor = props.stroke;
        }
    }
}
export class Rectangle extends DefaultShape {
    private width : number;
    private height : number;

    constructor (center = new Point(0,0), width = 0, height = 0, color = "black") {
        super(center, color);
        this.width = width;
        this.height = height;
    }

    
    public setWidth(w:number) {
        this.width = w;
    }
    public setHeight(h:number) {
        this.height = h;
    }
    
    

    override draw(ctx: CanvasRenderingContext2D, selected?:boolean): void {
        super.draw(ctx);
        const cx = this.center.getX();
        const cy = this.center.getY();
        const left = cx - this.width/2;
        const top = cy - this.height/2;
        ctx.strokeRect(left,top,this.width,this.height);
        if (selected) {
            const right = cx + this.width/2;
            const bottom = cy + this.height/2; 
            ctx.beginPath();
            ctx.arc(left,top,SELECT_RADIUS,0,2*Math.PI);
            ctx.moveTo(left+SELECT_RADIUS,bottom);
            ctx.arc(left,bottom,SELECT_RADIUS,0,2*Math.PI);
            ctx.moveTo(right+SELECT_RADIUS,bottom);
            ctx.arc(right,bottom,SELECT_RADIUS,0,2*Math.PI);
            ctx.moveTo(right+SELECT_RADIUS,top);
            ctx.arc(right,top,SELECT_RADIUS,0,2*Math.PI);
            ctx.stroke();
        }
    }

    override overlaps(r : Rect): boolean {
        function oneDOverlap(lo1:number, hi1:number, lo2:number, hi2:number) {
            return lo1 < hi2 && lo2 < hi1;
        }
        const cx1 = this.center.getX();
        const cy1 = this.center.getY();
        const cx2 = r.center.x;
        const cy2 = r.center.y;
        return oneDOverlap(cx1-this.width/2,cx1+this.width/2,cx2-r.width/2,cx2+r.width/2) &&
            oneDOverlap(cy1-this.height/2,cy1+r.height/2,cy2-r.height/2,cy2+r.height/2);
    }

    override toJSON() {
        return {...super.toJSON(), width:this.width, height:this.height};
    }

    override fromJSON(props : object) {
        if ("width" in props && typeof props.width === "number") {
            this.width = props.width;
        }
        if ("height" in props && typeof props.height === "number") {
            this.height = props.height;
        }
    }
}
ShapeFactory.register({ className : "Rectangle", create: () => new Rectangle()})
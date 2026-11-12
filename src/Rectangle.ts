import { Point } from './Point';
import { AbstractShape, Delta, Rect } from './Shape';

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
}
export class Rectangle extends DefaultShape {
    private width : number;
    private height : number;

    constructor (center : Point, width : number, height : number, color : string) {
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
    
    

    override draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx);
        const upperLeftX = this.center.getX() - this.width/2;
        const upperLeftY = this.center.getY() - this.height/2;
        ctx.strokeRect(upperLeftX,upperLeftY,this.width,this.height)
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

}
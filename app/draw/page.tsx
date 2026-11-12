"use client";

import { Shape } from '@/src/Shape';
import { Stroke } from '@/src/Stroke';
import { Point } from '@/src/Point';
import { Rectangle } from '@/src/Rectangle';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface Tool {
    down(p : Point) : void;
    drag(p : Point) : void;
    up(p : Point) : void
}

type Drawing = Array<Shape>;

interface Settings {
    color : string;
}

class StrokeTool implements Tool {
    private str : Stroke = new Stroke();
    private drawing : Drawing;
    private ctx : CanvasRenderingContext2D;
    private settings : Settings;

    constructor(drawing : Drawing, ctx : CanvasRenderingContext2D, settings : Settings) {
        this.drawing = drawing;
        this.ctx = ctx;
        this.settings = settings;
    }

    down(p : Point) {
        this.str = new Stroke(this.settings.color);
        this.str.add(p);
        this.drawing.push(this.str);
        this.ctx.strokeStyle = this.settings.color;
        this.ctx.beginPath();
        this.ctx.moveTo(p.getX(), p.getY());
    }

    drag(p : Point) {
        this.str.add(p);
        this.ctx.lineTo(p.getX(), p.getY());
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(p.getX(), p.getY());
    }

    up(p : Point) {
        // this.ctx.closePath();
        this.ctx.lineTo(p.getX(), p.getY());
        this.ctx.stroke();
    }
}

class RectangleTool implements Tool {
    private str : Rectangle = new Rectangle(new Point(0,0),0,0,"black");
    private drawing : Drawing;
    private ctx : CanvasRenderingContext2D;
    private initial : Point = new Point(0,0);
    private settings : Settings;

    constructor(drawing : Drawing, ctx : CanvasRenderingContext2D, settings : Settings) {
        this.drawing = drawing;
        this.ctx = ctx;
        this.settings = settings;
    }
    
    down(p : Point) {
        this.str = new Rectangle(p,0,0,this.settings.color);
        this.drawing.push(this.str);
        this.str.draw(this.ctx);
        this.initial = p;
    }

    drag(p : Point) {
        this.str.setCenter(new Point((this.initial.getX()+p.getX())/2, (this.initial.getY()+p.getY())/2));
        this.str.setWidth(Math.abs(this.initial.getX()-p.getX()));
        this.str.setHeight(Math.abs(this.initial.getY() - p.getY()));
        this.str.draw(this.ctx);
    }

    up(p : Point) {
        // nothing
    }
}

class SelectTool implements Tool {
    private drawing : Drawing;
    private ctx : CanvasRenderingContext2D;
    private initial : Point = new Point(0,0);
    private setSelected : (ss:Shape[]) => void;
    private settings : Settings;

    constructor(drawing : Drawing, setSelected : (ss:Shape[])=>void, ctx : CanvasRenderingContext2D, settings : Settings) {
        this.drawing = drawing;
        this.setSelected = setSelected;
        this.ctx = ctx;
        this.settings = settings;
    }

    down(p: Point): void {
        console.log("select mouse down");
        this.initial = p;
    }

    drag(p: Point): void {
        this.ctx.strokeStyle = "black";
        this.ctx.setLineDash([2,2,1,3]);
        const x = this.initial.getX();
        const y = this.initial.getY();
        this.ctx.strokeRect(x, y, p.getX()-x, p.getY()-y);
        this.ctx.setLineDash([]);
    }

    up(p: Point): void {
        const x = this.initial.getX();
        const y = this.initial.getY();
        // TODO: select shapes
        const center = new Point((x+p.getX())/2, (y+p.getY())/2);
        const width = (Math.abs(x-p.getX()));
        const height = (Math.abs(y - p.getY()));
        const rect = {center:{x:center.getX(), y:center.getY()}, width, height};
        this.setSelected(this.drawing.filter((sh) => sh.overlaps(rect)));
    }

}
const MARGIN = 24;
const TOOLHEIGHT = 24;

function getCtx(canvas : null|HTMLCanvasElement) : CanvasRenderingContext2D|null {
    return canvas?.getContext("2d") ?? null;
}

export default function Main() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);
    const colorRef = useRef<HTMLInputElement>(null);


    const [width, setWidth] = useState(500);
    const [height, setHeight] = useState(300);
    const [dirty, setDirty] = useState(0);


    const [drawing, _] = useState<Shape[]>([]);
    const [selected, setSelected] = useState<Shape[]>([]);

    const repaint = useMemo(() => () => {
        const canvas = canvasRef.current;
        const ctx = getCtx(canvas);
        console.log(`in repaint, ctx = ${ctx}.`);
        if (ctx === null) return;
        ctx.reset();
        console.log(`drawing has ${drawing.length} shapes`);
        for (const st of drawing) {
            st.draw(ctx,selected.includes(st));
        }
    }, [canvasRef, drawing, selected]);

    useEffect(() => {
        console.log(`using dirty = ${dirty}`);
        repaint();
    }, [dirty]);

    useEffect(() => {
        console.log('setting dirty');
        setDirty(dirty + 1);
    }, [width, height]);

    const nullTool: Tool = {
        down(_: Point) { },
        drag(_: Point) { },
        up(_: Point) { }
    };

    const [strokeTool, setStrokeTool] = useState(nullTool);
    const [rectangleTool, setRectangleTool] = useState(nullTool);
    const [selectTool, setSelectTool] = useState(nullTool);

    const [tool, setTool] = useState(nullTool);

    let settings: Settings = { color: "black" };

    useEffect(() => {
        const canvas = canvasRef.current;
        console.log('trying to initialize tools');
        const ctx = getCtx(canvas);
        if (ctx === null) return;
        console.log('initializing tools');
        setStrokeTool(new StrokeTool(drawing, ctx, settings));
        setRectangleTool(new RectangleTool(drawing, ctx, settings));
        setSelectTool(new SelectTool(drawing, setSelected, ctx, settings));
    }, [drawing, canvasRef]);

    


    useEffect(() => {
        console.log(`adding listeners to ${canvasRef.current}`);
        const canvas = canvasRef.current;
        if (canvas === null) return;

        function getScreenPoint(e: { clientX: number, clientY: number }) {
            const rect = canvas!.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            return new Point(x, y);
        }

        function mouseDown (e: MouseEvent) {
            console.log(`mouse down`);
            const p = getScreenPoint(e);
            tool.down(p);
        }

        function mouseMoved(e: MouseEvent) {
            const p = getScreenPoint(e);
            if (e.buttons == 1) {
                tool.drag(p);
            }
        }

        function mouseUp(e: MouseEvent) {
            console.log("mouse up");
            const p = getScreenPoint(e);
            tool.up(p);
            repaint();
        }

        canvas.addEventListener('mousedown', mouseDown);
        canvas.addEventListener('mousemove', mouseMoved);
        canvas.addEventListener('mouseup', mouseUp);
        return () => {
            canvas.removeEventListener('mousedown', mouseDown);
            canvas.removeEventListener('mousemove', mouseMoved);
            canvas.removeEventListener('mouseup', mouseUp);
        }
    }, [canvasRef, tool]);


    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        console.log(`useLayout canvas=${canvas}, window = ${window}`);
        if (canvas === null) return;
        if (window === null) return;
        const action = () => {
            const width = window.innerWidth - MARGIN;
            const height = window.innerHeight - MARGIN - TOOLHEIGHT
            console.log(`changing wndow size <${width}, ${height}>`)
            setWidth(width);
            setHeight(height);
        }
        action();
        window.addEventListener('resize', action);
        return () => {
            window.removeEventListener('resize', action);
        }
    }, [canvasRef]);

        
    useEffect(() => { 
        const select = selectRef.current;
        console.log(`adding selection listeners, with select=${select}`);
        if (select === null) return;
        const selected = () => {
            switch (select.value) {
                default:
                    setTool(nullTool);
                    console.log("selected null");
                    break;
                case "stroke":
                    setTool(strokeTool);
                    console.log('stroke tool compared to null tool = ',strokeTool === nullTool);
                    break;
                case "rectangle":
                    setTool(rectangleTool);
                    console.log("Selected rectangle");
                    break;
                case "select":
                    setTool(selectTool);
                    console.log("Selected select");
                    break;
            }
        };
        select.addEventListener('change', selected);
        return () => {
            select.removeEventListener('change', selected);
        }
    },[selectRef, strokeTool, rectangleTool, selectTool]);

    useEffect(() => {
        const color = colorRef.current;
        if (color === null) return;
        const changeColor = () => {
            settings.color = color.value; // settings = { ...settings, color:color.value };
        }
        color.addEventListener('change', changeColor);
        return () => {
            color.removeEventListener('change', changeColor);
        }
    }, [colorRef]);

    return (
        <>
        <select ref={selectRef}>
      <option value="">Select a drawing tool</option>
      <option value="select">Select</option>
      <option value="stroke">Stroke</option>
      <option value="rectangle">Rectangle</option>
    </select>
    <input type="color" ref={colorRef}/>
    <br/>
    <canvas ref={canvasRef} width={width} height={height}></canvas>
    </>
    );
}
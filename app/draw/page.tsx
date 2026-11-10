"use client";

import { Shape } from '@/src/Shape';
import { Stroke } from '@/src/Stroke';
import { Point } from '@/src/Point';
import { Rectangle } from '@/src/Rectangle';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { HooksClientContext } from 'next/dist/server/route-modules/pages/vendored/contexts/entrypoints';

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


        const [drawing,_] = useState<Shape[]>([]);

        const repaint = useMemo(() => () => {
            const canvas = canvasRef.current;
            const ctx = getCtx(canvas);
            console.log(`in repaint, ctx = ${ctx}.`);
            if (ctx === null) return;
            ctx.reset();
            console.log(`drawing has ${drawing.length} shapes`);
            for (const st of drawing) {
                st.draw(ctx);
            }
        }, [canvasRef, drawing]);

        useEffect(() => {
            console.log(`using dirty = ${dirty}`);
            repaint();
        },[dirty]);

        useEffect(() => {
            console.log('setting dirty');
            setDirty(dirty+1);
        },[width, height]);

        const nullTool : Tool = {
            down(_ : Point) { },
            drag(_ : Point) { },
            up(_ : Point) {}
        };

        const [strokeTool, setStrokeTool] = useState(nullTool);
        const [rectangleTool, setRectangleTool] = useState(nullTool);

        const [tool, setTool] = useState(nullTool);

        let settings : Settings = { color: "black" };

        useEffect(() => {
            const canvas = canvasRef.current;
            console.log('trying to initialize tools');
            const ctx = getCtx(canvas);
            if (ctx === null) return;
            console.log('initializing tools');
            setStrokeTool(new StrokeTool(drawing, ctx, settings));
            setRectangleTool(new RectangleTool(drawing, ctx, settings));
        }, [drawing, canvasRef]);

        const getScreenPoint = useMemo(() => (e : {clientX : number, clientY : number}) => {
            const canvas = canvasRef.current;
            if (canvas === null) return new Point(e.clientX, e.clientY);
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            return new Point(x, y);
        }, [canvasRef]);

        const mouseDown = useMemo(()=>(e:MouseEvent) => {
            console.log(`mouse down`);
            const p = getScreenPoint(e);
            tool.down(p);
        }, [tool]);

        const mouseMoved = useMemo(() => (e:MouseEvent) => {
            const p = getScreenPoint(e);
            const str = drawing[drawing.length-1];
            if (e.buttons == 1) {
                tool.drag(p);
            }
        }, [tool]);

        const mouseUp = useMemo(() => (e:MouseEvent) => {
            console.log("mouse up");
            const p = getScreenPoint(e);
            tool.up(p);
            repaint();
        }, [tool]);

        useEffect(() => {
            console.log(`adding listeners to ${canvasRef.current}`);
            const canvas = canvasRef.current;
            if (canvas === null) return;
            canvas.addEventListener('mousedown', mouseDown);
            canvas.addEventListener('mousemove', mouseMoved);
            canvas.addEventListener('mouseup', mouseUp);
            return () => {
                canvas.removeEventListener('mousedown', mouseDown);
                canvas.removeEventListener('mousemove', mouseMoved);
                canvas.removeEventListener('mouseup', mouseUp);
            }
        }, [canvasRef, tool]);
        
    
        useLayoutEffect( ()=> {
            const canvas = canvasRef.current;
            console.log(`useLayout canvas=${canvas}, window = ${window}`);
            if (canvas === null) return;
            if (window === null) return;
            const action = () => {
                const width = window.innerWidth - MARGIN;
                const height =  window.innerHeight - MARGIN - TOOLHEIGHT
                console.log(`changing wndow size <${width}, ${height}>`)
                setWidth(width);
                setHeight(height);
            }
            action();
            window.addEventListener('resize',action);
            return () => {
                window.removeEventListener('resize',action);
            }
        },[canvasRef]);

        
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
            }
        };
        select.addEventListener('change', selected);
        return () => {
            select.removeEventListener('change', selected);
        }
    },[selectRef, strokeTool, rectangleTool]);

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
      <option value="stroke">Stroke</option>
      <option value="rectangle">Rectangle</option>
    </select>
    <input type="color" ref={colorRef}/>
    <br/>
    <canvas ref={canvasRef} width={width} height={height}></canvas>
    </>
    );
}
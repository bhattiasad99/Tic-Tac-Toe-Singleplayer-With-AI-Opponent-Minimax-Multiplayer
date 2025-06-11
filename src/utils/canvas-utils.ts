import { Position } from "../types";
import { config } from "./canvas-config";

export const drawSingleLine = (ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.closePath();
}

export const drawContinuousLine = (ctx: CanvasRenderingContext2D, points: [number, number][]) => {
    ctx.beginPath();
    const firstPoint = points[0];
    ctx.moveTo(firstPoint[0], firstPoint[1]);
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        ctx.lineTo(point[0], point[1]);
    }
    ctx.stroke();
    ctx.closePath();
}

type RectangleProps = {
    fillColor?: string,
    strokeColor?: string,
    lineWidth?: number
}

type CircleProps = {
    fillColor?: string,
    strokeColor?: string,
    lineWidth?: number
}

export const drawRectangle = (ctx: CanvasRenderingContext2D, type: 'filled' | 'outlined', start: [number, number], dim: [number, number], props?: RectangleProps) => {
    ctx.beginPath()
    ctx.rect(start[0], start[1], dim[0], dim[1]);
    switch (type) {
        case 'filled': {
            ctx.fillStyle = props?.fillColor || "#ffffff";
            ctx.fill();
            break;
        }
        case "outlined": {
            ctx.strokeStyle = props?.strokeColor || "#000000";
            ctx.lineWidth = props?.lineWidth || 1;
            ctx.stroke();
            break;
        }
    }
}

export const drawCircle = (ctx: CanvasRenderingContext2D, center: Position, radius: number) => {
    ctx.strokeStyle = config.strokeColor;
    ctx.lineWidth = config.lineWidth;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();
}

export const drawX = (ctx: CanvasRenderingContext2D, center: Position, halfSize: number) => {
    drawSingleLine(ctx, center.x - halfSize, center.y - halfSize, center.x + halfSize, center.y + halfSize);
    drawSingleLine(ctx, center.x + halfSize, center.y - halfSize, center.x - halfSize, center.y + halfSize);
}

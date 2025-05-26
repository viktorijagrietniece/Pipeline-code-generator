import React from 'react';
import { useDraggable } from '@dnd-kit/core';

export default function DraggableBoxWrapper({id, position, label, background}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({id});

  const x = transform ? position.x + transform.x : position.x;
  const y = transform ? position.y + transform.y : position.y;

  const style = {transform: `translate(${x}px, ${y}px)`, background, color: '#fff',padding: '1rem 2rem',borderRadius: '8px', cursor: 'grab', position: 'absolute', userSelect: 'none', zIndex: isDragging ? 1000 : 'auto', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontWeight: 'bold'};

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {label}
    </div>
  );
  
}

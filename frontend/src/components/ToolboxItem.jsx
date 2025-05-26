import React from 'react';
import { useDraggable } from '@dnd-kit/core';

let lastMouseDownEvent = null;
export function getLastMouseDownEvent() {
  return lastMouseDownEvent;
}

export default function ToolboxItem({type, label }) {
  const { attributes, listeners, setNodeRef }= useDraggable({
    id: `toolbox-${type}`,
    data: {
      fromToolbox: true,
      type,

    },

  });

  const handleMouseDown = (e) => {

    lastMouseDownEvent = e; 
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onMouseDown={handleMouseDown}

      style={{background: '#88c', color: '#fff', padding: '10px', borderRadius: '8px',marginBottom: '8px', cursor: 'grab', userSelect: 'none'}}>
      {label}
    </div>
  );
  
}

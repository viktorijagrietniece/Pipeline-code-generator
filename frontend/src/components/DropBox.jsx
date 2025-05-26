import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import PipelineBox from './boxes/PipelineBox';
import StageBox from './boxes/StageBox';

const boxTypes = {
  pipeline: PipelineBox,
  stage: StageBox,
};

export default function DropBox({ children, dropRef, zoom, offset }) {
  const { setNodeRef } = useDroppable({ id: 'dropbox' });

  return (
    <div
      ref={(node)=> {

        setNodeRef(node);
        dropRef.current = node;
      }}
      style={{}}
    >
      <div
        style={{transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: '0 0',  position: 'relative', width: '100%',  height: '100%'}}>
        {children}
      </div>

    </div>
  );
}

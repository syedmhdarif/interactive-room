'use client';

import { Suspense } from 'react';
import { RoomLighting } from './lighting/RoomLighting';
import { AuroraSky } from './AuroraSky';
import { GrassField } from './GrassField';
import { TableModel } from './models/TableModel';
import { ComputerModel } from './models/ComputerModel';
import { PeopleModel } from './models/PeopleModel';
import { HouseModel } from './models/HouseModel';

export function Room() {
  return (
    <group name="world">
      {/* Very faint night fog — softens distant geometry */}
      <fog attach="fog" args={['#030810', 60, 280]} />

      {/* Night sky + vivid aurora curtains + stars */}
      <AuroraSky />

      {/* Lighting — moonlight + aurora bounce + desk screen glow */}
      <RoomLighting />

      {/* Ground — grass plane + instanced tufts + wildflowers */}
      <GrassField />

      {/* ── Desk setup — scene focal point ────────────────────────────── */}
      <Suspense fallback={null}>
        <TableModel />
      </Suspense>

      <Suspense fallback={null}>
        {/* Computer sits on the table surface */}
        <ComputerModel />
      </Suspense>

      <Suspense fallback={null}>
        {/* Person stands beside the table; speech bubble above head */}
        <PeopleModel />
      </Suspense>

      {/* ── Background ────────────────────────────────────────────────── */}
      <Suspense fallback={null}>
        {/* House — far behind the setup, lit from within */}
        <HouseModel />
      </Suspense>

    </group>
  );
}

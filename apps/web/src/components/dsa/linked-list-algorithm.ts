// Step-by-step "algorithm debugger" logic for singly linked list operations.
// Each build*Steps() function pre-computes the full sequence of steps a
// walkthrough should take — the UI just plays through this array one at a
// time (auto-play or manual next/prev), highlighting the matching pseudocode
// line and updating the 3D scene (current pointer, phantom node, rewiring).

export interface LLStep {
  pseudoLine: number;          // index into the pseudocode array to highlight
  note: string;                // human-readable explanation shown under the code
  current: number | null;      // index (in the CURRENT committed list) the `current` pointer is at
  phantomValue?: number;       // value of the in-progress new node, if any (insert only)
  phantomLinkTo?: number | null; // committed index the phantom's "next" arrow should point to
  markDelete?: number | null;  // committed index currently marked for removal (delete only)
  slow?: number | null;        // index of the `slow` pointer (find-middle / detect-cycle)
  fast?: number | null;        // index of the `fast` pointer (find-middle / detect-cycle)
  reversedUpto?: number | null; // index of `prev` while reversing — everything up to here has been flipped
  rewireNext?: number | null;  // target index the current node's arrow should point to right now (reverse)
  error?: string;              // set on the final step if the index/operation was invalid
  commit?: {                   // present only on the final, successful step
    type: 'INSERT_AT_HEAD' | 'INSERT_AFTER' | 'DELETE_AT_HEAD' | 'DELETE_AFTER'
        | 'REVERSE' | 'FIND_MIDDLE' | 'CYCLE_FOUND' | 'NO_CYCLE';
    at?: number;                // index to insert after / index being removed / index found
  };
}

export const INSERT_PSEUDOCODE = [
  'Create a new node.',
  'Store data in the new node.',
  'Set newNode.next = NULL.',
  'If index == 0:',
  '   newNode.next = head.',
  '   head = newNode.',
  '   return head.',
  'Set current = head.',
  'Traverse index - 1 times:',
  '   if current == NULL: index invalid, stop.',
  '   current = current.next.',
  'If current == NULL: index invalid.',
  'Set newNode.next = current.next.',
  'Set current.next = newNode.',
  'Return head.',
];

export const DELETE_PSEUDOCODE = [
  'If head == NULL: list is empty, return head.',
  'If index == 0:',
  '   temp = head.',
  '   head = head.next.',
  '   free temp.',
  '   return head.',
  'Set current = head.',
  'Traverse index - 1 times:',
  '   if current == NULL or current.next == NULL: index invalid, stop.',
  '   current = current.next.',
  'If current == NULL or current.next == NULL: index invalid.',
  'temp = current.next.',
  'current.next = temp.next.',
  'free temp.',
  'return head.',
];

export function buildInsertSteps(listLength: number, index: number, value: number): LLStep[] {
  const steps: LLStep[] = [];
  const n = listLength;

  steps.push({ pseudoLine: 0, current: null, phantomValue: value, note: 'Create a new node.' });
  steps.push({ pseudoLine: 1, current: null, phantomValue: value, note: `Store ${value} inside the new node.` });
  steps.push({ pseudoLine: 2, current: null, phantomValue: value, note: "Point the new node's next to NULL for now." });
  steps.push({ pseudoLine: 3, current: null, phantomValue: value, note: `Check: is index (${index}) == 0?` });

  if (index === 0) {
    steps.push({ pseudoLine: 4, current: null, phantomValue: value, phantomLinkTo: n > 0 ? 0 : null, note: 'Yes → newNode.next = head.' });
    steps.push({ pseudoLine: 5, current: null, phantomValue: value, phantomLinkTo: n > 0 ? 0 : null, note: 'head = newNode — the new node becomes the head.' });
    steps.push({ pseudoLine: 6, current: null, phantomValue: value, note: 'Return head. Insertion complete!', commit: { type: 'INSERT_AT_HEAD', at: 0 } });
    return steps;
  }

  steps.push({ pseudoLine: 7, current: 0, phantomValue: value, note: 'No → current = head (index 0).' });
  steps.push({ pseudoLine: 8, current: 0, phantomValue: value, note: `Need to traverse index - 1 = ${index - 1} time(s) to reach the node just before position ${index}.` });

  let cur = 0;
  for (let hop = 1; hop <= index - 1; hop++) {
    steps.push({ pseudoLine: 9, current: cur, phantomValue: value, note: `Hop ${hop}/${index - 1}: is current NULL? No — it's at index ${cur}.` });
    if (cur + 1 >= n) {
      steps.push({
        pseudoLine: 9, current: cur, phantomValue: value, error: `Index ${index} is out of bounds for a list of length ${n}.`,
        note: `current.next is NULL — index ${index} is invalid. Stopping.`,
      });
      return steps;
    }
    cur += 1;
    steps.push({ pseudoLine: 10, current: cur, phantomValue: value, note: `current = current.next → now at index ${cur}.` });
  }

  if (cur >= n) {
    steps.push({
      pseudoLine: 11, current: null, phantomValue: value, error: `Index ${index} is out of bounds for a list of length ${n}.`,
      note: 'current is NULL — index invalid.',
    });
    return steps;
  }

  const nextIdx = cur + 1 < n ? cur + 1 : null;
  steps.push({ pseudoLine: 12, current: cur, phantomValue: value, phantomLinkTo: nextIdx, note: `newNode.next = current.next (${nextIdx !== null ? `index ${nextIdx}` : 'NULL'}).` });
  steps.push({ pseudoLine: 13, current: cur, phantomValue: value, phantomLinkTo: nextIdx, note: `current.next = newNode — spliced in right after index ${cur}.` });
  steps.push({ pseudoLine: 14, current: cur, phantomValue: value, note: 'Return head. Insertion complete!', commit: { type: 'INSERT_AFTER', at: cur } });

  return steps;
}

export const REVERSE_PSEUDOCODE = [
  'Set prev = NULL.',
  'Set curr = head.',
  'While curr != NULL:',
  '   next = curr.next.',
  '   curr.next = prev.',
  '   prev = curr.',
  '   curr = next.',
  'Set head = prev.',
  'Return head.',
];

export const FIND_MIDDLE_PSEUDOCODE = [
  'Set slow = head.',
  'Set fast = head.',
  'While fast != NULL and fast.next != NULL:',
  '   slow = slow.next.',
  '   fast = fast.next.next.',
  'slow is now the middle node.',
  'Return slow.',
];

export const DETECT_CYCLE_PSEUDOCODE = [
  'Set slow = head.',
  'Set fast = head.',
  'While fast != NULL and fast.next != NULL:',
  '   slow = slow.next.',
  '   fast = fast.next.next.',
  '   if slow == fast: cycle found!',
  'If loop ends with no meeting: no cycle.',
];

export function buildReverseSteps(listLength: number): LLStep[] {
  const steps: LLStep[] = [];
  const n = listLength;
  if (n === 0) {
    steps.push({ pseudoLine: 0, current: null, error: 'The list is empty — nothing to reverse.', note: 'head is NULL.' });
    return steps;
  }

  steps.push({ pseudoLine: 0, current: null, note: 'prev = NULL — nothing behind us yet.' });
  steps.push({ pseudoLine: 1, current: 0, note: 'curr = head — start at index 0.' });

  let curr: number | null = 0;
  let prev: number | null = null;

  while (curr !== null) {
    const currIdx: number = curr;
    const originalNext: number | null = currIdx + 1 < n ? currIdx + 1 : null;
    const oldPrev = prev; // what curr's pointer will flip to point at

    steps.push({ pseudoLine: 2, current: currIdx, reversedUpto: oldPrev, rewireNext: originalNext, note: `curr (index ${currIdx}) is not NULL — keep going.` });
    steps.push({ pseudoLine: 3, current: currIdx, reversedUpto: oldPrev, rewireNext: originalNext, note: `next = curr.next (${originalNext !== null ? `index ${originalNext}` : 'NULL'}) — save it before we overwrite curr.next.` });
    steps.push({ pseudoLine: 4, current: currIdx, reversedUpto: oldPrev, rewireNext: oldPrev, note: 'curr.next = prev — pointer flipped to point backward.' });

    prev = currIdx;
    steps.push({ pseudoLine: 5, current: currIdx, reversedUpto: prev, rewireNext: oldPrev, note: `prev = curr — index ${currIdx} is now the front of the reversed section.` });

    curr = originalNext;
    steps.push({ pseudoLine: 6, current: curr, reversedUpto: prev, note: curr !== null ? `curr = next — move on to index ${curr}.` : 'curr = next — curr is now NULL, loop ends.' });
  }

  steps.push({ pseudoLine: 7, current: null, reversedUpto: prev, note: 'head = prev — the last node we flipped is the new head.' });
  steps.push({ pseudoLine: 8, current: null, note: 'Return head. Reversal complete!', commit: { type: 'REVERSE' } });
  return steps;
}

export function buildFindMiddleSteps(listLength: number): LLStep[] {
  const steps: LLStep[] = [];
  const n = listLength;
  if (n === 0) {
    steps.push({ pseudoLine: 0, current: null, error: 'The list is empty — there is no middle.', note: 'head is NULL.' });
    return steps;
  }

  steps.push({ pseudoLine: 0, current: 0, slow: 0, note: 'slow = head (index 0).' });
  steps.push({ pseudoLine: 1, current: 0, slow: 0, fast: 0, note: 'fast = head (index 0) too.' });

  let slow = 0;
  let fast = 0;
  while (fast !== null && fast < n - 1) {
    steps.push({ pseudoLine: 2, slow, fast, current: null, note: `Is fast (index ${fast}) not NULL and fast.next not NULL? Yes — keep going.` });
    slow += 1;
    steps.push({ pseudoLine: 3, slow, fast, current: null, note: `slow = slow.next → now at index ${slow}.` });
    fast = fast + 2 <= n - 1 ? fast + 2 : n; // n signals "ran off the end"
    steps.push({ pseudoLine: 4, slow, fast: fast < n ? fast : null, current: null, note: fast < n ? `fast = fast.next.next → now at index ${fast}.` : 'fast = fast.next.next → fast is now NULL.' });
    if (fast >= n) break;
  }

  steps.push({ pseudoLine: 5, slow, fast: null, current: null, note: `slow stopped at index ${slow} — that's the middle node.` });
  steps.push({ pseudoLine: 6, slow, current: null, note: `Return slow. The middle value is at index ${slow}.`, commit: { type: 'FIND_MIDDLE', at: slow } });
  return steps;
}

export function buildDetectCycleSteps(listLength: number, cycleTarget: number | null): LLStep[] {
  const steps: LLStep[] = [];
  const n = listLength;
  if (n === 0) {
    steps.push({ pseudoLine: 0, current: null, error: 'The list is empty.', note: 'head is NULL.' });
    return steps;
  }

  // Simulate the "next" pointer as a simple function so a cycle can be
  // demonstrated without changing the real (acyclic) committed list.
  const nextOf = (i: number): number | null => (i + 1 < n ? i + 1 : cycleTarget);

  steps.push({ pseudoLine: 0, current: 0, slow: 0, note: 'slow = head (index 0).' });
  steps.push({ pseudoLine: 1, current: 0, slow: 0, fast: 0, note: 'fast = head (index 0) too.' });

  let slow = 0;
  let fast = 0;
  const maxIterations = n * 3 + 5; // safety cap — a real cycle would loop forever otherwise
  for (let iter = 0; iter < maxIterations; iter++) {
    const fastNext1 = nextOf(fast);
    if (fastNext1 === null) {
      steps.push({ pseudoLine: 2, slow, fast: null, current: null, note: 'fast (or fast.next) is NULL — reached the end.' });
      steps.push({ pseudoLine: 6, slow, fast: null, current: null, note: 'The loop ended without slow and fast ever meeting — no cycle here.', commit: { type: 'NO_CYCLE' } });
      return steps;
    }
    const fastNext2 = nextOf(fastNext1);
    if (fastNext2 === null) {
      steps.push({ pseudoLine: 2, slow, fast: fastNext1, current: null, note: 'fast.next.next is NULL — reached the end.' });
      steps.push({ pseudoLine: 6, slow, fast: fastNext1, current: null, note: 'The loop ended without slow and fast ever meeting — no cycle here.', commit: { type: 'NO_CYCLE' } });
      return steps;
    }
    steps.push({ pseudoLine: 2, slow, fast, current: null, note: `Is fast (index ${fast}) and fast.next both non-NULL? Yes — keep going.` });
    slow = nextOf(slow) ?? slow;
    steps.push({ pseudoLine: 3, slow, fast, current: null, note: `slow = slow.next → now at index ${slow}.` });
    fast = fastNext2;
    steps.push({ pseudoLine: 4, slow, fast, current: null, note: `fast = fast.next.next → now at index ${fast}.` });

    if (slow === fast) {
      steps.push({ pseudoLine: 5, slow, fast, current: null, note: `slow and fast are both at index ${slow} — they met! A cycle exists.`, commit: { type: 'CYCLE_FOUND', at: slow } });
      return steps;
    }
    steps.push({ pseudoLine: 5, slow, fast, current: null, note: 'slow != fast — not met yet, keep looping.' });
  }

  steps.push({ pseudoLine: 6, slow, fast, current: null, error: 'Safety limit reached.', note: 'Stopped as a precaution — this should not normally happen.' });
  return steps;
}

export function buildDeleteSteps(listLength: number, index: number): LLStep[] {
  const steps: LLStep[] = [];
  const n = listLength;

  if (n === 0) {
    steps.push({ pseudoLine: 0, current: null, error: 'The list is empty — nothing to delete.', note: 'head == NULL, so we return immediately.' });
    return steps;
  }

  steps.push({ pseudoLine: 0, current: null, note: 'head is not NULL — the list has nodes.' });
  steps.push({ pseudoLine: 1, current: null, note: `Check: is index (${index}) == 0?` });

  if (index === 0) {
    steps.push({ pseudoLine: 2, current: null, markDelete: 0, note: 'Yes → temp = head (the node to remove).' });
    steps.push({ pseudoLine: 3, current: null, markDelete: 0, note: 'head = head.next — head moves forward one node.' });
    steps.push({ pseudoLine: 4, current: null, markDelete: 0, note: 'free temp — the old head is discarded.' });
    steps.push({ pseudoLine: 5, current: null, note: 'Return head. Deletion complete!', commit: { type: 'DELETE_AT_HEAD', at: 0 } });
    return steps;
  }

  steps.push({ pseudoLine: 6, current: 0, note: 'No → current = head (index 0).' });
  steps.push({ pseudoLine: 7, current: 0, note: `Need to traverse index - 1 = ${index - 1} time(s) to reach the node just before position ${index}.` });

  let cur = 0;
  for (let hop = 1; hop <= index - 1; hop++) {
    steps.push({ pseudoLine: 8, current: cur, note: `Hop ${hop}/${index - 1}: is current or current.next NULL? No — current is at index ${cur}.` });
    if (cur + 1 >= n - 1) {
      if (cur + 1 >= n) {
        steps.push({
          pseudoLine: 8, current: cur, error: `Index ${index} is out of bounds for a list of length ${n}.`,
          note: `current.next is NULL — index ${index} is invalid. Stopping.`,
        });
        return steps;
      }
    }
    cur += 1;
    steps.push({ pseudoLine: 9, current: cur, note: `current = current.next → now at index ${cur}.` });
  }

  if (cur >= n - 1) {
    steps.push({
      pseudoLine: 10, current: cur, error: `Index ${index} is out of bounds for a list of length ${n}.`,
      note: 'current or current.next is NULL — index invalid.',
    });
    return steps;
  }

  const targetIdx = cur + 1;
  steps.push({ pseudoLine: 11, current: cur, markDelete: targetIdx, note: `temp = current.next → the node at index ${targetIdx} is marked for removal.` });
  steps.push({ pseudoLine: 12, current: cur, markDelete: targetIdx, note: 'current.next = temp.next — the node is unlinked from the chain.' });
  steps.push({ pseudoLine: 13, current: cur, markDelete: targetIdx, note: 'free temp — the old node is discarded.' });
  steps.push({ pseudoLine: 14, current: cur, note: 'Return head. Deletion complete!', commit: { type: 'DELETE_AFTER', at: targetIdx } });

  return steps;
}
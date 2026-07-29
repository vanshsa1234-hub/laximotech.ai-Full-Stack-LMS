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
  error?: string;              // set on the final step if the index was invalid
  commit?: {                   // present only on the final, successful step
    type: 'INSERT_AT_HEAD' | 'INSERT_AFTER' | 'DELETE_AT_HEAD' | 'DELETE_AFTER';
    at: number;                // index to insert after / index being removed
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
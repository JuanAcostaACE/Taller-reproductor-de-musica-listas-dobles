export interface Song {
  title: string;
  artist: string;
  file: File;
  coverUrl: string | null;
  audioUrl: string;
}

export class SongNode {
  public data: Song;
  public next: SongNode | null = null;
  public prev: SongNode | null = null;

  constructor(song: Song) {
    this.data = song;
  }
}

export class DoublyLinkedList {
  public head: SongNode | null = null;
  public tail: SongNode | null = null;
  public current: SongNode | null = null;
  public size: number = 0;

  addToEnd(song: Song): SongNode {
    const node = new SongNode(song);

    if (this.head === null) {
      this.head = node;
      this.tail = node;
      this.current = node;
    } else {
      // Encadenar al final
      node.prev = this.tail;
      this.tail!.next = node;
      this.tail = node;
    }

    this.size++;
    return node;
  }

  addToStart(song: Song): SongNode {
    const node = new SongNode(song);

    if (this.head === null) {
      this.head = node;
      this.tail = node;
      this.current = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }

    this.size++;
    return node;
  }

  addAtPosition(song: Song, index: number): SongNode {
    if (index <= 0) return this.addToStart(song);
    if (index >= this.size) return this.addToEnd(song);

    let current = this.head!;
    for (let i = 0; i < index - 1; i++) {
      current = current.next!;
    }

    const node = new SongNode(song);
    const nextNode = current.next;

    node.prev = current;
    node.next = nextNode;
    current.next = node;
    if (nextNode) nextNode.prev = node;

    this.size++;
    return node;
  }

  remove(node: SongNode): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    if (this.current === node) {
      this.current = node.next ?? node.prev ?? null;
    }

    node.next = null;
    node.prev = null;

    this.size--;
  }

  goNext(): SongNode | null {
    if (this.current?.next) {
      this.current = this.current.next;
    }
    return this.current;
  }

  goPrev(): SongNode | null {
    if (this.current?.prev) {
      this.current = this.current.prev;
    }
    return this.current;
  }

  setCurrent(node: SongNode): void {
    this.current = node;
  }

  toArray(): SongNode[] {
    const result: SongNode[] = [];
    let node = this.head;
    while (node !== null) {
      result.push(node);
      node = node.next;
    }
    return result;
  }

  indexOf(target: SongNode): number {
    let node = this.head;
    let idx = 0;
    while (node !== null) {
      if (node === target) return idx;
      node = node.next;
      idx++;
    }
    return -1;
  }

  isEmpty(): boolean {
    return this.head === null;
  }
}

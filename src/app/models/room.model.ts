export class Room {
  constructor(
    readonly id: number,
    readonly name: string,
    readonly capacity: number,
    readonly description: string | null,
    readonly availability: []
  ) { }
}

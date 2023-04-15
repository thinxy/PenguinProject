export default class Command {
  constructor(client, options) {
    this.client = client
    this.name = options.name
    this.aliases = options.aliases || []
    this.description = options.description || "none"
    this.usage = options.usage || ""
  }
}

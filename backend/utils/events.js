import { EventEmitter } from "events";

export const dbEventEmitter = new EventEmitter();

/**
 * Mongoose schema plugin that hooks post-save, post-remove,
 * and post-update actions to emit global DB change events.
 */
export const socketWatcherPlugin = (schema) => {
  const triggerUpdate = () => {
    dbEventEmitter.emit("change");
  };

  // Document middleware hooks
  schema.post("save", triggerUpdate);
  schema.post("remove", triggerUpdate);

  // Query/Model middleware hooks
  schema.post("findOneAndDelete", triggerUpdate);
  schema.post("findOneAndUpdate", triggerUpdate);
  schema.post("updateMany", triggerUpdate);
  schema.post("deleteOne", triggerUpdate);
  schema.post("deleteMany", triggerUpdate);
};

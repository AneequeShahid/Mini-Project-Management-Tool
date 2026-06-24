import mongoose from "mongoose";

const { Schema, model } = mongoose;

const burndownSchema = new Schema(
  {
    sprint: { type: Schema.Types.ObjectId, ref: "Sprint", required: true },
    date: { type: Date, required: true },
    remainingPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Burndown = model("Burndown", burdenSchema);

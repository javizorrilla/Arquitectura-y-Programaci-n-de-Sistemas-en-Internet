import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { slotsCollection } from "../db/mongo.ts";
import { SlotSchema } from "../db/schemas.ts";

type PutBookSlotContext = RouterContext<
  "/bookSlot",
  Record<string | number, string | undefined>,
  Record<string, any>
>;

export const bookSlot = async (context: PutBookSlotContext) => {
  try {
    const value = await context.request.body().value;
    if (
      !value.year ||
      !value.month ||
      !value.day ||
      !value.hour ||
      !value.dni
    ) {
      context.response.status = 406;
      return;
    }

    if(!value.id_doctor) {
        context.response.body = {message: "id_doctor is required"};
    }

    const { year, month, day, hour, dni, id_doctor } = value;
    const slot = await slotsCollection.findOne({
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      hour: parseInt(hour),
      available: true,
      id_doctor: id_doctor
    });
    if (!slot) {
      context.response.status = 404;
      return;
    }
    await slotsCollection.updateOne(
      { _id: slot.id },
      { $set: { available: false, dni, id_doctor } }
    );
    context.response.status = 200;
    const { id, ...rest } = slot;
    context.response.body = { ...rest, available: false, dni, id_doctor };
  } catch (e) {
    console.error(e);
    context.response.status = 500;
  }
};
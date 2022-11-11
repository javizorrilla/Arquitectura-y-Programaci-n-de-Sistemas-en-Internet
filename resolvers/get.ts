import { getQuery } from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { slotsCollection } from "../db/mongo.ts";
import { SlotSchema } from "../db/schemas.ts";

type GetAvailabeSlotsContext = RouterContext<
  "/availableSlots",
  Record<string | number, string | undefined>,
  Record<string, any>
>;

export const availableSlots = async (context: GetAvailabeSlotsContext) => {
  try {
    const params = getQuery(context, { mergeParams: true });
    if (!params.year || !params.month) {
      context.response.status = 403;
      return;
    }

    const { year, month, day, id_doctor } = params;
    if (!day) {
      const slots = await slotsCollection
        .find({
          year: parseInt(year),
          month: parseInt(month),
          available: true,
        })
        .toArray();
      context.response.body = context.response.body = slots.map((slot) => {
        const { id, ...rest } = slot;
        return rest;
      });
    } else {
      const slots = await slotsCollection
        .find({
          year: parseInt(year),
          month: parseInt(month),
          day: parseInt(day),
          available: true,
        })
        .toArray();
      context.response.body = slots.map((slot) => {
        const { id, ...rest } = slot;
        return rest;
      });
    }
    
    if(!id_doctor) {
        const slots = await slotsCollection.find({
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day),
            availableSlots: true,
            //id_doctor: id_doctor
        }).toArray();

        context.response.body = slots.map((slot) => {
            const { id, ...rest } = slot;
            return rest;
        });
    } else {
        const slots = await slotsCollection.find({
            year: parseInt(year),
            month: parseInt(month),
            day: parseInt(day),
            availableSlots: true,
            id_doctor: id_doctor
        }).toArray();

        context.response.body = slots.map((slot) => {
            const { id, ...rest } = slot;
            return rest;
        });
    }

  } catch (e) {
    console.error(e);
    context.response.status = 500;
  }
};

type GetAvailabeSlotsDoctorContext = RouterContext<
  "/doctorApppointments/:id_doctor",
  {
    id_doctor: string;
  } &
  Record<string | number, string | undefined>,
  Record<string, any>
>;

const createDate = (
    year: number,
    month: number,
    day: number,
    hour: number
  ): boolean => {
    const date = new Date(year, month, day, hour);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day &&
      date.getHours() === hour
    );
  };

export const availableSlotsDoctor = async (context: GetAvailabeSlotsDoctorContext) => {
    try{
        const params = getQuery(context, {mergeParams: true});
        if(!params.id_doctor) {
            context.response.body = {message: "No id_doctor provided"};
            return;
        }

        const {id_doctor} = params;

        const date = new Date();

        const slots = await slotsCollection.find({
            id_doctor: id_doctor,
            available: false,
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDay(),
            hour: date.getHours()
        }).toArray();

        context.response.body = slots.map((slot) => {
            const { id, ...rest } = slot;
            return rest;
        });

    } catch(e) {
        console.error(e);
    }



};
type GetAvailabeSlotsDniContext = RouterContext<
  "/patientAppointments/:dni",
  { 
    dni: string;
  } &
  Record<string | number, string | undefined>,
  Record<string, any>
>;

export const availableSlotsDNI = async (context: GetAvailabeSlotsDoctorContext) => {
    try{
        const params = getQuery(context, {mergeParams: true});
        if(!params.dni) {
            context.response.body = {message: "No dni provided"};
            return;
        }

        const {dni} = params;

        const date = new Date();

        const slots = await slotsCollection.find({
            dni: dni,
            available: true,
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDay(),
            hour: date.getHours()
        }).toArray();

        /*const slot2 = slots.filter((slot) => {
            if(slot.year >= date.getFullYear() && slot.month >= date.getMonth() && slot.day >= date.getDay() && slot.hour >= date.getHours()) {
                return slot;
            }
        });*/

        context.response.body = slots.map((slot) => {
            const { id, ...rest } = slot;
            return rest;
        });

    } catch(e) {
        console.error(e);
    }
};
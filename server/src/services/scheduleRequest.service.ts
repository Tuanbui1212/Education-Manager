import { ScheduleRequest } from '../models/scheduleRequest.model';

export class ScheduleRequestService {
  async initRequest(classIds: string[]) {
    const classes = classIds.map((id) => ({
      classId: id,
      optionalRequirements: [],
    }));

    const newRequest = new ScheduleRequest({
      classes,
      status: 'pending',
    });

    return await newRequest.save();
  }

  async updateClassPreference(requestId: string, classId: string, prefs: string[]) {
    return await ScheduleRequest.findOneAndUpdate(
      { _id: requestId, 'classes.classId': classId },
      { $set: { 'classes.$.optionalRequirements': prefs } },
      { new: true },
    );
  }

  async getRequestById(id: string) {
    return await ScheduleRequest.findById(id).populate('classes.classId');
  }

  async cancelRequest(id: string) {
    return await ScheduleRequest.findByIdAndDelete(id);
  }
}

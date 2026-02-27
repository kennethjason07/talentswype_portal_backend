import { AdminVideoService } from '../services/adminVideo.service.js';

export class AdminVideoController {
  static async getAllInterviews(req, res, next) {
    try {
      const interviews = await AdminVideoService.getAllInterviews();
      return res.status(200).json({ success: true, data: interviews });
    } catch (error) {
      return next(error);
    }
  }
}

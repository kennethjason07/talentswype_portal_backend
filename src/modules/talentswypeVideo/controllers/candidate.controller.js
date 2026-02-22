import { CandidateService } from '../services/candidate.service.js';
import UserModel from '../../../models/user.Model.js';

export class CandidateController {
  static async signup(req, res, next) {
    try {
      const candidate = await CandidateService.signupCandidate(req.validated.body);
      return res.status(201).json({ success: true, data: candidate });
    } catch (error) {
      return next(error);
    }
  }

  static async triggerInterview(req, res, next) {
    try {
      const { id } = req.validated.params;
      const result = await CandidateService.triggerInterview(id, req.validated.body);
      return res.status(202).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const { id } = req.validated.params;
      const candidate = await CandidateService.getCandidate(id);
      return res.status(200).json({ success: true, data: candidate });
    } catch (error) {
      return next(error);
    }
  }

  static async getVideo(req, res, next) {
    try {
      const { id } = req.validated.params;
      const video = await CandidateService.getCandidateVideo(id);
      return res.status(200).json({ success: true, data: video });
    } catch (error) {
      return next(error);
    }
  }

  static async getSelf(req, res, next) {
    try {
      // req.user is populated by UserAuth middleware with { userId, userType }
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const candidate = await CandidateService.getCandidateByEmail(user.email);
      return res.status(200).json({ success: true, data: candidate });
    } catch (error) {
      return next(error);
    }
  }
}

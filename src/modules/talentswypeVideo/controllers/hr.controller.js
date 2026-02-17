import { HrService } from '../services/hr.service.js';

export class HrController {
  static async shortlist(req, res, next) {
    try {
      const { jobId } = req.validated.params;
      const { candidateId, notes } = req.validated.body;

      const result = await HrService.shortlistCandidate({
        jobId,
        candidateId,
        notes,
        hrUserId: req.hrUser.id,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return next(error);
    }
  }
}

import mongoose from 'mongoose';
import Project from './project.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';
import activityService from '../activity/activity.service';

class ProjectService {
  async getAll(query: any) {
    const builder = new QueryBuilder(Project.find(), query).search(['name', 'clientName', 'description', 'tasks.title']).filter().sort().paginate();
    const projects = await builder.query;
    const total = await builder.countTotal();
    return { projects, total };
  }

  async getOne(publicId: string) {
    const project = await Project.findOne({ publicId });
    if (!project) throw ApiError.notFound('Project not found');
    return project;
  }

  async create(data: any, user: { _id?: string; name?: string }) {
    const project = await Project.create({ ...data, createdBy: new mongoose.Types.ObjectId(user._id), createdByName: user.name || 'Unknown' });
    await activityService.logActivity({
      action: 'create',
      entityType: 'project',
      entityId: project.publicId,
      entityName: project.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Created project ${project.name}`,
    });
    return project;
  }

  async update(publicId: string, data: any, user: { _id?: string; name?: string }) {
    const project = await Project.findOneAndUpdate({ publicId }, data, { new: true, runValidators: true });
    if (!project) throw ApiError.notFound('Project not found');
    await activityService.logActivity({
      action: 'update',
      entityType: 'project',
      entityId: project.publicId,
      entityName: project.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Updated project ${project.name}`,
    });
    return project;
  }

  async delete(publicId: string, user: { _id?: string; name?: string }) {
    const project = await Project.findOneAndDelete({ publicId });
    if (!project) throw ApiError.notFound('Project not found');
    await activityService.logActivity({
      action: 'delete',
      entityType: 'project',
      entityId: project.publicId,
      entityName: project.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Deleted project ${project.name}`,
    });
  }
}

export default new ProjectService();

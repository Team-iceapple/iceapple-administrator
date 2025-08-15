import type { MemberModel } from '$lib/models/projects/member.model.svelte';
import type { Project, ProjectCreateFile } from '$lib/types';

export class ProjectFormModel {
  project = $state<Project>(this.#emptyProject());
  projectFile = $state<Partial<ProjectCreateFile>>(this.#emptyProjectFile());

  constructor(private readonly memberModel: MemberModel) {}

  setProject = (newProject: Project) => {
    this.project = { ...newProject };
  };

  addMember = () => {
    this.project.members.push(this.memberModel.toPlain());
    this.memberModel.clear();
  };

  deleteMember = (index: number) => {
    this.project.members.splice(index, 1);
  };

  clear = () => {
    this.project = { ...this.#emptyProject() };

    this.projectFile.pdf = undefined;
    this.projectFile.thumbnail = undefined;
  };

  #emptyProject() {
    return {
      id: '',
      name: '',
      team_name: '',
      members: [],
      description: '',
      thumbnail: '',
      year: new Date().getFullYear(),
      main_url: '',
      pdf_url: '',
    };
  }

  #emptyProjectFile() {
    return {
      pdf: undefined,
      thumbnail: undefined,
    };
  }
}

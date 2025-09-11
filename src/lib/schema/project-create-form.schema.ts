import { z } from 'zod';

const MemberSchema = z.object({
  name: z.string().min(1, '팀원 이름은 1글자 이상이어야 합니다.'),
  extra: z.string(),
});

const MemberStringSchema = z.string().refine((val) => {
  const arr = JSON.parse(val);

  if (!Array.isArray(arr)) return false;

  const result = z
    .array(MemberSchema)
    .min(1, '팀원은 최소 1명 이상이어야 합니다.')
    .safeParse(arr);

  return result.success;
}, '팀원은 최소 1명 이상이어야 합니다.');

export const ProjectCreateFormSchema = z.object({
  year: z.coerce.string(),
  name: z.string().min(1, '프로젝트 이름은 1글자 이상이어야 합니다.'),
  team_name: z.string().min(1, '팀 이름은 1글자 이상이어야 합니다.'),
  members: MemberStringSchema,
  description: z.string().min(1, '설명은 한글자 이상이어야 합니다.'),
  main_url: z.url('유효한 주소여야 합니다.'),
  thumbnail: z.file().refine((file) => {
    return file.type.includes('image');
  }, '썸네일은 필수 항목입니다.'),
  pdf: z.file().refine((file) => {
    return file.type === 'application/pdf';
  }, 'pdf 파일은 필수 항목입니다.'),
});

export type ProjectCreateForm = z.infer<typeof ProjectCreateFormSchema>;

import type { Member } from '$lib/types';

function emptyMember(): Member {
  return {
    name: '',
    extra: '',
  };
}

export class MemberModel {
  member = $state<Member>(emptyMember());

  toPlain = () => {
    return $state.snapshot(this.member);
  };

  clear = () => {
    this.member = { ...emptyMember() };
  };
}

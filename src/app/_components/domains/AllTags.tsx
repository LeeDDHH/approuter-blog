import type { Tags } from '@/app/lib/utilities';
import Tag from '../elements/Tag';

type AllTagsProps = { allTags: Tags };

const AllTags = ({ allTags }: AllTagsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {allTags.map((tag) => {
        return <Tag key={tag} tag={tag} />;
      })}
    </div>
  );
};

export default AllTags;

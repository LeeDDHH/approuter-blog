import type { Tags } from "@/app/lib/utilities";
import Tag from "../elements/Tag";

type AllTagProps = {allTags: Tags}

const AllTags = ({allTags}: AllTagProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {allTags.map((tag) => {
        return (
          <Tag
            key={tag}
            tag={tag} />
        );
      })}
    </div>
  );
};

export default AllTags;
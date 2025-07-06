import type { Tags } from "@/app/lib/utilities";
import Tag from "../elements/Tag";

type AllTagProps = {allTags: Tags}

const AllTags = ({allTags}: AllTagProps) => {
  return (
    <div className="mt-4">
      <h3 className="text-2xl font-semibold mb-4">Tags</h3>
      <div className="flex gap-2 overflow-x-auto">
        {allTags.map((tag) => {
          return (
            <Tag
              key={tag}
              tag={tag} />
          );
        })}
      </div>
    </div>
  );
};

export default AllTags;
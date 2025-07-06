type TagProps = { tag: string };

const Tag = ({ tag }: TagProps) => {
  return (
    <button
      key={tag}
      type="button"
      className="rounded-lg border-2 border-black bg-white p-2 font-medium text-black text-md dark:border-white dark:bg-black dark:text-white"
    >
      {tag}
    </button>
  );
};

export default Tag;

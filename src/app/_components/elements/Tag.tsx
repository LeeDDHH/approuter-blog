type TagProps = {tag: string}

const Tag = ({tag}: TagProps) => {
  return (
    <button
      key={tag}
      className="text-black dark:text-white bg-white dark:bg-black border-2 border-black dark:border-white font-medium text-md rounded-lg p-2"
    >
      {tag}
    </button>
  );
};

export default Tag;
const PageHeader = ({ title }: { title: string }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-[var(--color-text-main)] border-b-2 border-gray-200 pb-2 inline-block">
        {title}
      </h1>
    </div>
  );
};

export default PageHeader;

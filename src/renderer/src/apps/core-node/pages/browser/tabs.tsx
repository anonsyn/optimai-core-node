const Tabs = () => {
  const tabs = [
    {
      id: 1,
      title: 'New tab'
    }
  ]
  return (
    <div className="flex w-full overflow-x-auto border-t border-white/4">
      {tabs.map((tab) => {
        return (
          <div key={tab.id} className="bg-accent h-[50px] max-w-60 flex-1">
            <div className="flex h-full items-center gap-2 pr-4 pl-5">
              <p className="text-16 leading-normal font-medium text-white">{tab.title}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Tabs

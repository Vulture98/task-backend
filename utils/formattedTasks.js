const formattedTasks = (tasks) =>
  tasks.map((task) => ({
    title: task.title,
    status: task.status,
    index: task.index,
  }));

  export default formattedTasks
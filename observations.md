
changing taskmodel 
descritpion as not required as not-required


i wasnt using $set
await Task.updateMany(
        { userId: req.user.id },
        { $set: { tasks: updatedTasks } }
      );
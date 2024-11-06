
changing taskmodel 
descritpion as not required as not-required


# Current Date and Time: 2024-11-06 17:42:48
i wasnt using $set before
await Task.updateMany(
        { userId: req.user.id },
        { $set: { tasks: updatedTasks } }
      );

# next 
update index when i delete a task both in front-end n in back-end

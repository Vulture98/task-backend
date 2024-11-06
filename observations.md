
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


# testing ideas: #5s
u probably need to write diff kinds of testing as well
i.e. in my current code
every u need to test whether indexed r lined up 
i.e. 0, 1, 2, 3 ...
cz if theyre not something def issue
this is not straightforward 
but basically ur checking d "obvious stuff"
testing: check d obvious stuff
cz when i deleted indexes didnot update 
ive seen index of 83 
when i hardly had 4 tasks then u can easily spot issues


# best way: #5s
instead of working in big file create a small file n work on that specific code thats easy
else uve to keep naviagting in big shit n loose ur way
ive tried this for update-index-on-delete-task much better 

# req.body
u STRICTLY receive ony what uve sent from frontend
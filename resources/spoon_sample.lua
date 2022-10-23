--- === _spoonName_ ===
---
--- _description_
---
--- Download:
local obj = {}
obj.__index = obj

-- Metadata
obj.name = "_spoonName_"
obj.version = "0.1.0"
obj.author = "<_author_@email>"
obj.homepage = ""
obj.license = "MIT - https://opensource.org/licenses/MIT"

--- _spoonName_:helloWorld()
--- Method
--- Hello World Spoon Sample
---
--- Parameters:
---  * name - A `string` value
---
--- Returns:
---  * None
---
--- Notes:
---  * None
function obj:helloWorld(name)
  print(string.format('Hello %s from %s', name, self.name))
end

return obj

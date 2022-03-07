--- === SpoonName ===
---
--- Simulate a mouse click at specific point in some Application.
---
--- Download:

local obj = {}
obj.__index = obj

-- Metadata
obj.name = "SpoonName"
obj.version = "0.0.1"
obj.author = "author <email>"
obj.homepage = ""
obj.license = "MIT - https://opensource.org/licenses/MIT"

--- SpoonName:helloWorld()
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
namespace BlazorWasmClient.Models.ViewModels
{
    public class RoleWriteVM
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; }
        public List<string> Permissions { get; set; }
    }
}

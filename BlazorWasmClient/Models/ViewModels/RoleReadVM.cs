﻿namespace BlazorWasmClient.Models.ViewModels
{
    public class RoleReadVM
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; }
        public DateTime Created_At { get; set; }
        public DateTime Updated_At { get; set; }
        public string Permissions { get; set; }
    }
}
